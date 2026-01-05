'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { getReputationStats, getBatchReputationStats } from "./reviews";

export async function getDashboardOverview() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. User Profile (Critical - fetch first)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: {
        where: { isVisible: true },
        include: {
          skill: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  // 2. Main Lists (Batch 1)
  const [proposals, applications] = await Promise.all([
    prisma.proposal.findMany({
      where: { ownerId: userId },
      include: {
        offeredSkills: true,
        neededSkills: true,
        _count: {
          select: {
            applications: true,
            swaps: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: {
        proposal: {
          ownerId: userId,
        },
      },
      include: {
        applicant: {
          include: {
            skills: {
              where: { isVisible: true },
              include: {
                skill: true,
              },
            },
          },
        },
        proposal: {
          include: {
            owner: true,
            offeredSkills: true,
            neededSkills: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // 3. Secondary Lists (Batch 2)
  const [sentApplications, swaps] = await Promise.all([
    // Outgoing Applications (sent) - needed to disable "Apply" button
    prisma.application.findMany({
      where: { applicantId: userId },
      select: { proposalId: true },
    }),
    // Swaps
    prisma.swap.findMany({
      where: {
        OR: [{ teacherId: userId }, { studentId: userId }],
      },
      include: {
        proposal: {
          include: {
            offeredSkills: true,
            neededSkills: true,

          },
        },
        teacher: true,
        student: true,
        reviews: true,
        messages: {
          where: {
            receiverId: userId,
            isRead: false,
          },
          select: { id: true }
        }
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
  ]);

  // 4. Reputation (Batch 3 - has 2 internal queries)
  const reputation = await getReputationStats(userId);

  return {
    user,
    proposals,
    applications,
    sentApplications,
    swaps,
    reputation,
  };
}

export async function getLeaderboard() {
  // Fetch users who have completed swaps or received reviews
  // For a better leaderboard, we could query for users with most activities first
  const users = await prisma.user.findMany({
    take: 50,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      industry: true,
    }
  });

  const userIds = users.map(u => u.id);
  const statsMap = await getBatchReputationStats(userIds);

  const leaderboard = users.map(user => ({
    ...user,
    reputation: statsMap[user.id],
  })).sort((a, b) => (b.reputation?.reputationPoints || 0) - (a.reputation?.reputationPoints || 0))
    .slice(0, 10); // Return top 10

  return leaderboard;
}