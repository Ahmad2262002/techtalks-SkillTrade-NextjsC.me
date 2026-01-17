'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { cache } from "react";
import { unstable_cache, revalidatePath } from "next/cache";

export async function createReview(input: {
  swapId: string;
  rating: number;
  comment?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. Fetch swap details
  const swap = await prisma.swap.findUnique({
    where: { id: input.swapId },
    include: {
      proposal: {
        include: { offeredSkills: true }
      }
    }
  });

  if (!swap) throw new Error("Swap not found");

  // 2. Authorization Check
  const isTeacher = swap.teacherId === userId;
  const isStudent = swap.studentId === userId;

  if (!isTeacher && !isStudent) {
    throw new Error("Not authorized to review this swap");
  }

  // 3. Status Check
  if (swap.status !== "COMPLETED") {
    throw new Error("You cannot review a swap until it is marked Complete");
  }

  // 4. Duplicate Check
  const existingReview = await prisma.review.findFirst({
    where: {
      swapId: input.swapId,
      authorId: userId,
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this swap");
  }

  const receiverId = isTeacher ? swap.studentId : swap.teacherId;

  // 5. Create Review
  const review = await prisma.review.create({
    data: {
      swapId: input.swapId,
      authorId: userId,
      receiverId,
      rating: input.rating,
      comment: input.comment,
    },
  });

  // 6. Endorsement Logic
  // If Student rates Teacher >= 4, verify the skills
  if (isStudent && input.rating >= 4) {
    const skillsTaught = swap.proposal.offeredSkills;

    for (const skill of skillsTaught) {
      // Use updateMany or careful upsert logic if the userSkill might not exist yet
      // For MVP, we assume the Teacher added the skill manually when creating the proposal.
      // If not, we skip or catch error.
      try {
        await prisma.userSkill.update({
          where: {
            userId_skillId: {
              userId: receiverId, // The Teacher
              skillId: skill.id
            }
          },
          data: {
            endorsementCount: { increment: 1 },
            source: "ENDORSED" // Upgrade status
          }
        });
      } catch {
        // Ignore if userSkill doesn't exist (edge case)
      }
    }
  }

  revalidatePath('/');
  return review;
}

export async function listReviewsForUser(userId: string) {
  return prisma.review.findMany({
    where: { receiverId: userId },
    include: {
      author: true,
      swap: {
        include: { proposal: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

const getCachedPublicReviewsV3 = unstable_cache(
  async (limit: number) => {
    return prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        swap: {
          select: {
            id: true,
            proposal: {
              select: {
                title: true
              }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
  ['v3-public-reviews'],
  { tags: ['reviews-public'], revalidate: 3600 }
);

export async function getPublicReviews(limit = 6) {
  return getCachedPublicReviewsV3(limit);
}


export type ReputationStats = {
  completedSwaps: number;
  totalReviews: number;
  positiveReviews: number;
  averageRating: number;
  totalEndorsements: number;
  reputationPoints: number;
  level: number;
  title: string;
  color: string;
  battingAverage: number;
};

function calculateReputation(
  completedSwaps: number,
  reviews: { rating: number }[],
  endorsements: number
): ReputationStats {
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0;

  // Creative Reputation Logic
  // Points: Completed Swap (10) + Positive Review (5) + Endorsement (3)
  const basePoints = (completedSwaps * 10) + (positiveReviews * 5) + (endorsements * 3);
  const reputationPoints = Math.floor(basePoints * (1 + (averageRating / 5)));

  let level = 1;
  let title = "Newcomer";
  let color = "text-slate-400";

  if (reputationPoints >= 1000) {
    level = 5;
    title = "Skill Legend";
    color = "text-amber-400";
  } else if (reputationPoints >= 400) {
    level = 4;
    title = "Master Mentor";
    color = "text-purple-400";
  } else if (reputationPoints >= 150) {
    level = 3;
    title = "Swap Pro";
    color = "text-sky-400";
  } else if (reputationPoints >= 50) {
    level = 2;
    title = "Rising Talent";
    color = "text-emerald-400";
  }

  return {
    completedSwaps,
    totalReviews,
    positiveReviews,
    averageRating,
    totalEndorsements: endorsements,
    reputationPoints,
    level,
    title,
    color,
    battingAverage:
      totalReviews === 0 ? 0 : Number((positiveReviews / totalReviews).toFixed(2)),
  };
}

export const getReputationStats = cache(async (userId: string): Promise<ReputationStats> => {
  const completedSwaps = await prisma.swap.count({
    where: {
      OR: [{ teacherId: userId }, { studentId: userId }],
      status: "COMPLETED",
    },
  });

  const reviews = await prisma.review.findMany({
    where: { receiverId: userId },
    select: { rating: true }
  });

  const endorsements = await prisma.userSkill.count({
    where: {
      userId,
      source: "ENDORSED"
    }
  });

  return calculateReputation(completedSwaps, reviews, endorsements);
});

export const getBatchReputationStats = cache(async (userIds: string[]): Promise<Record<string, ReputationStats>> => {
  if (userIds.length === 0) return {};

  const uniqueUserIds = [...new Set(userIds)];

  // 1. Efficient parallel database aggregation (SQL Level)
  const [swapsAsTeacher, swapsAsStudent, reviewAggregates, endorsementCounts] = await Promise.all([
    prisma.swap.groupBy({
      by: ['teacherId'],
      where: { teacherId: { in: uniqueUserIds }, status: "COMPLETED" },
      _count: true
    }),
    prisma.swap.groupBy({
      by: ['studentId'],
      where: { studentId: { in: uniqueUserIds }, status: "COMPLETED" },
      _count: true
    }),
    prisma.review.groupBy({
      by: ['receiverId'],
      where: { receiverId: { in: uniqueUserIds } },
      _count: { rating: true },
      _sum: { rating: true }
    }),
    prisma.userSkill.groupBy({
      by: ['userId'],
      where: { userId: { in: uniqueUserIds }, source: "ENDORSED" },
      _count: true
    })
  ]);

  // 2. Map results for O(1) lookup
  const teacherCounts = Object.fromEntries(swapsAsTeacher.map((g: any) => [g.teacherId, g._count]));
  const studentCounts = Object.fromEntries(swapsAsStudent.map((g: any) => [g.studentId, g._count]));
  const reviewCounts = Object.fromEntries(reviewAggregates.map((g: any) => [g.receiverId, g._count.rating]));
  const reviewSums = Object.fromEntries(reviewAggregates.map((g: any) => [g.receiverId, g._sum.rating || 0]));
  const endorsementsMap = Object.fromEntries(endorsementCounts.map((g: any) => [g.userId, g._count]));

  // 3. Final calculation using optimized data
  const statsMap: Record<string, ReputationStats> = {};
  uniqueUserIds.forEach(userId => {
    const completedSwaps = (teacherCounts[userId] || 0) + (studentCounts[userId] || 0);
    const totalReviews = reviewCounts[userId] || 0;
    const totalRatingSum = reviewSums[userId] || 0;

    // We need to approximate the average rating for calculateReputation
    // but calculateReputation expects the full list of reviews for some reason.
    // Let's modify calculateReputation to take summary data or mock the list.
    // For now, let's mock the list with a single entry if we have the average, 
    // but that's slightly inaccurate for positive review count.

    // Actually, calculateReputation uses `reviews.filter(r => r.rating >= 4).length`.
    // Let's also fetch positive review count in the aggregation.
  });

  // Re-calculating with more granular aggregation to avoid fetching ALL reviews
  const [positiveReviewCounts] = await Promise.all([
    prisma.review.groupBy({
      by: ['receiverId'],
      where: { receiverId: { in: uniqueUserIds }, rating: { gte: 4 } },
      _count: true
    })
  ]);

  const positiveCounts = Object.fromEntries(positiveReviewCounts.map((g: any) => [g.receiverId, g._count]));

  uniqueUserIds.forEach(userId => {
    const completedSwaps = (teacherCounts[userId] || 0) + (studentCounts[userId] || 0);
    const totalReviews = reviewCounts[userId] || 0;
    const totalRatingSum = reviewSums[userId] || 0;
    const positiveReviews = positiveCounts[userId] || 0;
    const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;
    const endorsements = endorsementsMap[userId] || 0;

    // Direct reputation points logic to avoid needing the full reviews array
    const basePoints = (completedSwaps * 10) + (positiveReviews * 5) + (endorsements * 3);
    const reputationPoints = Math.floor(basePoints * (1 + (averageRating / 5)));

    let level = 1;
    let title = "Newcomer";
    let color = "text-slate-400";

    if (reputationPoints >= 1000) { level = 5; title = "Skill Legend"; color = "text-amber-400"; }
    else if (reputationPoints >= 400) { level = 4; title = "Master Mentor"; color = "text-purple-400"; }
    else if (reputationPoints >= 150) { level = 3; title = "Swap Pro"; color = "text-sky-400"; }
    else if (reputationPoints >= 50) { level = 2; title = "Rising Talent"; color = "text-emerald-400"; }

    statsMap[userId] = {
      completedSwaps,
      totalReviews,
      positiveReviews,
      averageRating,
      totalEndorsements: endorsements,
      reputationPoints,
      level,
      title,
      color,
      battingAverage: totalReviews === 0 ? 0 : Number((positiveReviews / totalReviews).toFixed(2)),
    };
  });

  return statsMap;
});
