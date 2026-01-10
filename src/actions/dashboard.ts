'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { getReputationStats, getBatchReputationStats } from "./reviews";

export async function getDashboardOverview() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. Fetch EVERYTHING in ONE single query to save connections and improve perf
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: {
        where: { isVisible: true },
        include: { skill: true },
      },
      proposals: {
        include: {
          offeredSkills: true,
          neededSkills: true,
          applications: {
            include: {
              applicant: {
                include: {
                  skills: {
                    where: { isVisible: true },
                    include: { skill: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { applications: true, swaps: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      swapsAsTeacher: {
        include: {
          proposal: {
            include: { offeredSkills: true, neededSkills: true },
          },
          teacher: true,
          student: true,
          reviews: true,
        },
        orderBy: { startedAt: "desc" },
        take: 20,
      },
      swapsAsStudent: {
        include: {
          proposal: {
            include: { offeredSkills: true, neededSkills: true },
          },
          teacher: true,
          student: true,
          reviews: true,
        },
        orderBy: { startedAt: "desc" },
        take: 20,
      },
      applications: {
        // These are applications SENT by the user
        select: { proposalId: true },
      },
    },
  });

  if (!user) throw new Error("User not found");

  // 2. Fetch reputation
  const reputation = await getReputationStats(userId);

  // 3. Extract applications received on my proposals
  const receivedApplications = user.proposals.flatMap(p =>
    p.applications.map(app => ({ ...app, proposal: p }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  // 4. Combine swaps
  const combinedSwaps = [...(user.swapsAsTeacher || []), ...(user.swapsAsStudent || [])]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 20);

  return {
    user,
    proposals: user.proposals,
    applications: receivedApplications,
    sentApplications: user.applications,
    swaps: combinedSwaps,
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