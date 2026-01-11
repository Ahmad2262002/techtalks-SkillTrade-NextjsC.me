'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { getReputationStats } from "./reviews";
import { unstable_cache } from "next/cache";

/* -------------------------------------------------------------------------- */
/*                              CURRENT USER                                  */
/* -------------------------------------------------------------------------- */

export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true } },
      reviewsReceived: true,
      reviewsGiven: true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                              PUBLIC PROFILE                                 */
/* -------------------------------------------------------------------------- */

export async function getUserProfile(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Wrap the expensive data fetching
  const getCachedProfileData = unstable_cache(
    async (id: string) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          skills: {
            include: { skill: true },
          },

          reviewsReceived: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                }
              },
              swap: {
                include: {
                  teacher: { select: { id: true } },
                  proposal: {
                    include: {
                      offeredSkills: true
                    }
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },

          swapsAsTeacher: {
            where: { status: "COMPLETED" },
          },

          swapsAsStudent: {
            where: { status: "COMPLETED" },
          },
        },
      });

      if (!user) return null;

      const reputation = await getReputationStats(id);

      // Calculate endorsements dynamically
      const skillEndorsementMap = new Map<string, number>();

      user.reviewsReceived.forEach(review => {
        if (review.rating >= 4) {
          if (review.swap.teacher.id === id) {
            review.swap.proposal.offeredSkills.forEach((s: any) => {
              const skillId = s.id;
              skillEndorsementMap.set(skillId, (skillEndorsementMap.get(skillId) || 0) + 1);
            });
          }
        }
      });

      return {
        id: user.id,
        name: user.name,
        industry: user.industry,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,

        skills: user.skills.map(s => {
          const endorsementCount = skillEndorsementMap.get(s.skillId) || 0;
          return {
            id: s.id,
            skillId: s.skillId,
            name: s.skill.name,
            source: endorsementCount > 0 ? "ENDORSED" : s.source,
            isVisible: s.isVisible,
            endorsementCount,
          };
        }),

        reviewsReceived: user.reviewsReceived.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          author: review.author,
          swap: {
            id: review.swap.id,
            proposal: {
              title: review.swap.proposal.title,
            }
          }
        })),

        reputation,
      };
    },
    [`user-profile-${userId}`],
    { revalidate: 300, tags: [`profile-${userId}`] } // Cache for 5 minutes
  );

  const data = await getCachedProfileData(userId);

  if (!data) throw new Error("User not found");
  return data;
}

/* -------------------------------------------------------------------------- */
/*                              UPSERT PROFILE                                  */
/* -------------------------------------------------------------------------- */

export async function upsertProfile(input: {
  name?: string | null;
  industry?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return prisma.user.upsert({
    where: { id: userId },

    update: {
      name: input.name ?? undefined,
      industry: input.industry ?? undefined,
      bio: input.bio ?? undefined,
      avatarUrl: input.avatarUrl ?? undefined,
      phoneNumber: input.phoneNumber ?? undefined,
    },

    create: {
      id: userId,
      email: existingUser?.email ?? "",
      name: input.name ?? null,
      industry: input.industry ?? null,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      phoneNumber: input.phoneNumber ?? null,
    },
  });
}
