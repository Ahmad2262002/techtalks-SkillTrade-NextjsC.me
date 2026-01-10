'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ProposalStatus } from "@prisma/client";

export async function createProposal(input: {
  title: string;
  description: string;
  modality: string;
  offeredSkillIds: string[];
  neededSkillIds: string[];
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.proposal.create({
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
}

import { getReputationStats, getBatchReputationStats } from "./reviews";

export async function listPublicProposals(params: {
  wantSkillIds?: string[];
  haveSkillIds?: string[];
  modality?: string;
  search?: string;
  take?: number;
  skip?: number;
  includeAllStatuses?: boolean;
  dateRange?: string;
} = {}) {
  const {
    wantSkillIds,
    haveSkillIds,
    modality,
    search,
    take = 1000,
    skip = 0,
    includeAllStatuses = false,
    dateRange,
  } = params;

  // --- DATE FILTER LOGIC ---
  let dateFilter = {};
  if (dateRange) {
    const now = new Date();
    let startDate = new Date();

    if (dateRange === 'today') {
      startDate.setTime(now.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours
    } else if (dateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setDate(now.getDate() - 30);
    }

    if (dateRange !== 'ANY') {
      dateFilter = {
        createdAt: {
          gte: startDate,
        },
      };
    }
  }

  // --- SEARCH LOGIC ---
  const searchFilter = search
    ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { owner: { name: { contains: search, mode: "insensitive" as const } } },
        {
          offeredSkills: {
            some: { name: { contains: search, mode: "insensitive" as const } },
          },
        },
        {
          neededSkills: {
            some: { name: { contains: search, mode: "insensitive" as const } },
          },
        },
      ],
    }
    : {};

  const proposals = await prisma.proposal.findMany({
    where: {
      status: includeAllStatuses ? undefined : "OPEN",
      modality: modality ?? undefined,
      ...searchFilter,
      ...dateFilter,
      AND: [
        wantSkillIds && wantSkillIds.length
          ? {
            neededSkills: {
              some: {
                id: {
                  in: wantSkillIds,
                },
              },
            },
          }
          : {},
        haveSkillIds && haveSkillIds.length
          ? {
            offeredSkills: {
              some: {
                id: {
                  in: haveSkillIds,
                },
              },
            },
          }
          : {},
      ],
    },
    include: {
      owner: true,
      offeredSkills: true,
      neededSkills: true,
      _count: {
        select: {
          applications: true,
          swaps: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    skip,
  });

  console.log(`[API] listPublicProposals: found ${proposals.length} items. Params:`, { search, modality, includeAllStatuses });

  // Batch fetch reputation for all owners
  const ownerIds = proposals.map(p => p.ownerId);
  const reputationMap = await getBatchReputationStats(ownerIds);

  const proposalsWithReputation = proposals.map((p) => {
    return {
      ...p,
      owner: {
        ...p.owner,
        reputation: reputationMap[p.ownerId],
      },
    };
  });

  return proposalsWithReputation;
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
  const applicantIds = proposal.applications.map(app => app.applicantId);
  const reputationMap = await getBatchReputationStats(applicantIds);

  const applicationsWithReputation = proposal.applications.map((app) => {
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