'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { getReputationStats } from "./reviews";

export async function getDashboardOverview() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const [user, proposals, applications, sentApplications, swaps, reputation] = await Promise.all([
    // 1. User Profile
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          where: { isVisible: true },
          include: {
            skill: true,
          },
        },
      },
    }),
    // 2. My Proposals
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
    // 3. Incoming Applications (received)
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
    // 4. Outgoing Applications (sent) - needed to disable "Apply" button
    prisma.application.findMany({
      where: { applicantId: userId },
      select: { proposalId: true },
    }),
    // 5. Swaps
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
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    // 6. Reputation
    getReputationStats(userId),
  ]);

  return {
    user,
    proposals,
    applications,
    sentApplications,
    swaps,
    reputation,
  };
}