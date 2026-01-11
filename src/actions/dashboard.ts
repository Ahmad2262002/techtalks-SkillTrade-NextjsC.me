'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { getReputationStats, getBatchReputationStats } from "./reviews";
import { unstable_cache } from "next/cache";

/* -------------------------------------------------------------------------- */
/*                          GRANULAR DATA FETCHING                            */
/*       "Formula 1" Speed: Only fetch what you need for the active tab       */
/* -------------------------------------------------------------------------- */

export async function getDashboardUserBasic() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      industry: true,
      skills: {
        select: {
          id: true,
          skill: { select: { name: true, id: true } }
        }
      }, // Needed for PostModal
    }
  });
}

// For "Browse" tab: We need to know what I've applied to, so we can filter them out
export async function getMySentApplications() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      applications: { select: { proposalId: true } }
    }
  });

  return user?.applications || [];
}

// For "My Proposals" tab
export async function getMyProposals() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.proposal.findMany({
    where: { ownerId: userId },
    include: {
      offeredSkills: true,
      neededSkills: true,
      applications: {
        include: {
          applicant: {
            include: {
              skills: { where: { isVisible: true }, include: { skill: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      _count: { select: { applications: true, swaps: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// For "Active Swaps" tab
export async function getMySwapsAndInteractions() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. Fetch Swaps
  const swapsAsTeacher = await prisma.swap.findMany({
    where: { teacherId: userId },
    include: {
      proposal: { include: { offeredSkills: true, neededSkills: true } },
      teacher: true,
      student: true,
      reviews: true,
    },
    orderBy: { startedAt: "desc" },
    take: 20
  });

  const swapsAsStudent = await prisma.swap.findMany({
    where: { studentId: userId },
    include: {
      proposal: { include: { offeredSkills: true, neededSkills: true } },
      teacher: true,
      student: true,
      reviews: true,
    },
    orderBy: { startedAt: "desc" },
    take: 20
  });

  const swaps = [...swapsAsTeacher, ...swapsAsStudent]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 20);

  // 2. Fetch Received Applications (Optimized: only if not already fetched in MyProposals)
  // We need applications received on my proposals
  const myProposals = await prisma.proposal.findMany({
    where: { ownerId: userId },
    include: {
      applications: {
        include: {
          applicant: {
            include: {
              skills: { where: { isVisible: true }, include: { skill: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const receivedApplications = myProposals.flatMap(p =>
    p.applications.map(app => ({ ...app, proposal: p }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  return { swaps, receivedApplications };
}

// Legacy wrapper if needed, or we can just remove it.
// Kept for backward compatibility if any client code relies on the exact shape,
// but we will mainly use the granular ones below.
export async function getDashboardOverview() {
  const [userBasic, myProposals, interactions, reputation, sentApps] = await Promise.all([
    getDashboardUserBasic(),
    getMyProposals(),
    getMySwapsAndInteractions(),
    getReputationStats((await getCurrentUserId())!),
    getMySentApplications()
  ]);

  if (!userBasic) throw new Error("User not found");

  return {
    user: userBasic,
    proposals: myProposals,
    applications: interactions.receivedApplications,
    sentApplications: sentApps,
    swaps: interactions.swaps,
    reputation, // Calculated on the fly, fast enough
  };
}

export const getLeaderboard = unstable_cache(
  async () => {
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
  },
  ['dashboard_leaderboard'], // Cache key
  { revalidate: 60, tags: ['leaderboard'] } // Revalidate every 60 seconds
);