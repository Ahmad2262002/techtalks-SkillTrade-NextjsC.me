'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ProposalStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { unstable_cache, revalidatePath } from "next/cache";

export async function createProposal(input: {
  title: string;
  description: string;
  modality: string;
  offeredSkillIds: string[];
  neededSkillIds: string[];
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const result = await prisma.proposal.create({
    data: {
      ownerId: userId,
      title: input.title,
      description: input.description,
      modality: input.modality,
      offeredSkills: {
        connect: input.offeredSkillIds.map((id) => ({ id })),
      },
      neededSkills: {
        connect: input.neededSkillIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath('/');
  revalidatePath('/browse');
  return result;
}

import { getReputationStats, getBatchReputationStats } from "./reviews";

/**
 * V3 Lean Cache Pattern: Defines the fetcher separately and wraps it in a versioned key.
 * This prevents many-to-many payload bloat and stale cache issues.
 */
const getCachedPublicProposalsV5 = unstable_cache(
  async (serializedParams: string) => {
    const params = JSON.parse(serializedParams);
    const {
      wantSkillIds,
      haveSkillIds,
      modality,
      search,
      take = 25,
      skip = 0,
      includeAllStatuses = false,
      dateRange,
    } = params;

    const dateFilter = dateRange ? {
      createdAt: {
        gte: dateRange === 'today' ? new Date(Date.now() - 86400000) :
          dateRange === 'week' ? new Date(Date.now() - 604800000) :
            dateRange === 'month' ? new Date(Date.now() - 2592000000) : undefined
      }
    } : {};

    const searchFilter = search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { owner: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    } : {};

    return prisma.proposal.findMany({
      where: {
        status: includeAllStatuses ? undefined : "OPEN",
        modality: modality ?? undefined,
        ...searchFilter,
        ...(dateFilter.createdAt?.gte ? dateFilter : {}),
        AND: [
          wantSkillIds?.length ? { neededSkills: { some: { id: { in: wantSkillIds } } } } : {},
          haveSkillIds?.length ? { offeredSkills: { some: { id: { in: haveSkillIds } } } } : {},
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        modality: true,
        status: true,
        imageUrl: true,
        createdAt: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            name: true,
            // avatarUrl EXCLUDED to stay under Next.js 2MB cache limit (prevents payload bloat)
            industry: true,
          }
        },
        offeredSkills: { select: { id: true, name: true } },
        neededSkills: { select: { id: true, name: true } },
        _count: { select: { applications: true, swaps: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
  },
  ['v5-public-proposals'],
  { tags: ['proposals-public'], revalidate: 3600 }
);

export async function listPublicProposals(params: any = {}) {
  const serialized = JSON.stringify(params);
  const proposals = await getCachedPublicProposalsV5(serialized);

  // Batch fetch reputation AND avatars efficiently outside of cache
  const ownerIds = [...new Set(proposals.map((p: any) => p.ownerId))] as string[];

  const [reputationMap, ownersWithAvatars] = await Promise.all([
    getBatchReputationStats(ownerIds),
    prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, avatarUrl: true }
    })
  ]);

  const avatarMap = Object.fromEntries(ownersWithAvatars.map((u: any) => [u.id, u.avatarUrl]));

  return proposals.map((p: any) => ({
    ...p,
    owner: {
      ...p.owner,
      reputation: reputationMap[p.ownerId],
      avatarUrl: avatarMap[p.ownerId]
    },
  }));
}

export async function listMyProposals() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.proposal.findMany({
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
  });
}

export async function getProposalById(proposalId: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      owner: {
        include: {
          skills: true
        }
      },
      offeredSkills: true,
      neededSkills: true,
      applications: {
        include: {
          applicant: true,
        },
        orderBy: { createdAt: "desc" },
      },
      swaps: true,
    },
  });

  if (!proposal) return null;

  // Attach reputation to owner
  const ownerReputation = await getReputationStats(proposal.ownerId);

  // Attach reputation to applicants in batch
  const applicantIds = proposal.applications.map((app: any) => app.applicantId) as string[];
  const reputationMap = await getBatchReputationStats(applicantIds);

  const applicationsWithReputation = proposal.applications.map((app: any) => {
    return {
      ...app,
      applicant: {
        ...app.applicant,
        reputation: reputationMap[app.applicantId],
      },
    };
  });

  return {
    ...proposal,
    owner: {
      ...proposal.owner,
      reputation: ownerReputation,
    },
    applications: applicationsWithReputation,
  };
}

export async function updateProposalStatus(params: {
  proposalId: string;
  status: ProposalStatus;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.proposalId },
  });

  if (!proposal || proposal.ownerId !== userId) {
    throw new Error("Proposal not found");
  }

  return prisma.proposal.update({
    where: { id: params.proposalId },
    data: {
      status: params.status,
    },
  });
}

export async function rescindProposal(proposalId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { swaps: true },
  });

  if (!proposal || proposal.ownerId !== userId) {
    throw new Error("Proposal not found");
  }

  if (proposal.swaps.length > 0) {
    throw new Error("Cannot rescind a proposal with swaps");
  }

  return prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: "CLOSED",
    },
  });
}