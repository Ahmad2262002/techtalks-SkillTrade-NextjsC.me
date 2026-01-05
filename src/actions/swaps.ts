'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { SwapStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Creates a formal Swap record from an application.
 * Also handles cascading status updates and notifications.
 */
export async function createSwapFromApplication(applicationId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      proposal: true,
    },
  });

  if (!application) throw new Error("Application not found");
  if (application.proposal.ownerId !== userId) {
    throw new Error("Not authorized to accept this application");
  }

  // 1. Create the Swap
  // Teacher is the proposal owner; student is the applicant
  const swap = await prisma.swap.create({
    data: {
      proposalId: application.proposalId,
      teacherId: application.proposal.ownerId,
      studentId: application.applicantId,
    },
  });

  // 2. Mark application as ACCEPTED
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "ACCEPTED" },
  });

  // 3. Reject all other pending applications for the same proposal
  await prisma.application.updateMany({
    where: {
      proposalId: application.proposalId,
      id: { not: applicationId },
      status: "PENDING",
    },
    data: { status: "REJECTED" },
  });

  // 4. Mark proposal as IN_PROGRESS
  await prisma.proposal.update({
    where: { id: application.proposalId },
    data: { status: "IN_PROGRESS" },
  });

  // 5. Notify the student (applicant) that the swap has started
  await prisma.notification.create({
    data: {
      userId: application.applicantId,
      type: "SWAP_STARTED",
      message: `Sync started! Your request for "${application.proposal.title}" was accepted.`,
      link: `/dashboard?tab=active-swaps`,
    },
  });

  revalidatePath('/dashboard');
  return swap;
}

/**
 * Lists all swaps for the current user.
 */
export async function listMySwaps() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.swap.findMany({
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
    },
    orderBy: { startedAt: "desc" },
  });
}

/**
 * Toggles a user's completion status for a swap.
 * If both parties mark it as complete, the swap status moves to COMPLETED.
 */
export async function updateSwapProgress(swapId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const swap = await prisma.swap.findUnique({
    where: { id: swapId },
    include: { proposal: true }
  });

  if (!swap) throw new Error("Swap not found");
  if (swap.teacherId !== userId && swap.studentId !== userId) {
    throw new Error("Not authorized");
  }

  const isTeacher = swap.teacherId === userId;
  const updateData: Prisma.SwapUpdateInput = {};

  if (isTeacher) {
    updateData.teacherHasCompleted = !swap.teacherHasCompleted;
  } else {
    updateData.studentHasCompleted = !swap.studentHasCompleted;
  }

  // Check if THIS update will result in both being true
  const willBeTeacherComplete = isTeacher ? (updateData.teacherHasCompleted as boolean) : swap.teacherHasCompleted;
  const willBeStudentComplete = !isTeacher ? (updateData.studentHasCompleted as boolean) : swap.studentHasCompleted;

  if (willBeTeacherComplete && willBeStudentComplete) {
    updateData.status = "COMPLETED";
    updateData.completedAt = new Date();

    // Finalize proposal
    await prisma.proposal.update({
      where: { id: swap.proposalId },
      data: { status: "CLOSED" }
    });

    // Notify partner
    const partnerId = isTeacher ? swap.studentId : swap.teacherId;
    await prisma.notification.create({
      data: {
        userId: partnerId,
        type: "SWAP_COMPLETED",
        message: `Congratulations! Your sync for "${swap.proposal.title}" is now COMPLETE.`,
        link: `/dashboard?tab=history`,
      }
    });
  }

  const updatedSwap = await prisma.swap.update({
    where: { id: swapId },
    data: updateData
  });

  revalidatePath('/dashboard');
  return updatedSwap;
}

/**
 * Cancels a swap and re-opens the proposal.
 */
export async function cancelSwap(swapId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const swap = await prisma.swap.findUnique({
    where: { id: swapId },
    include: { proposal: true }
  });

  if (!swap || (swap.teacherId !== userId && swap.studentId !== userId)) {
    throw new Error("Swap not found");
  }

  const updatedSwap = await prisma.swap.update({
    where: { id: swapId },
    data: { status: "CANCELLED" }
  });

  // Re-open proposal
  await prisma.proposal.update({
    where: { id: swap.proposalId },
    data: { status: "OPEN" }
  });

  // Notify partner
  const partnerId = swap.teacherId === userId ? swap.studentId : swap.teacherId;
  await prisma.notification.create({
    data: {
      userId: partnerId,
      type: "SWAP_CANCELLED",
      message: `The sync for "${swap.proposal.title}" has been cancelled by the partner.`,
      link: `/dashboard?tab=browse`,
    }
  });

  revalidatePath('/dashboard');
  return updatedSwap;
}

/**
 * Legacy/Simple update status (usually for admin or forced closure)
 */
export async function updateSwapStatus(params: {
  swapId: string;
  status: SwapStatus;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const swap = await prisma.swap.findUnique({
    where: { id: params.swapId },
    include: {
      proposal: true
    }
  });

  if (!swap || (swap.teacherId !== userId && swap.studentId !== userId)) {
    throw new Error("Swap not found");
  }

  const updatedSwap = await prisma.swap.update({
    where: { id: params.swapId },
    data: {
      status: params.status,
      completedAt: params.status === "COMPLETED" ? new Date() : swap.completedAt,
    },
  });

  // Logic for ending/resetting proposals
  if (params.status === "COMPLETED") {
    await prisma.proposal.update({
      where: { id: swap.proposalId },
      data: { status: "CLOSED" }
    });
  } else if (params.status === "CLOSED" || params.status === "CANCELLED") {
    await prisma.proposal.update({
      where: { id: swap.proposalId },
      data: { status: "OPEN" }
    });
  }

  // Notifications for the partner
  const partnerId = swap.teacherId === userId ? swap.studentId : swap.teacherId;
  const statusLabels: Record<string, string> = {
    COMPLETED: "marked as COMPLETED",
    CLOSED: "CLOSED",
    CANCELLED: "CANCELLED"
  };

  await prisma.notification.create({
    data: {
      userId: partnerId,
      type: "SWAP_STATUS_UPDATE",
      message: `Your sync for "${swap.proposal.title}" was ${statusLabels[params.status] || params.status}.`,
      link: `/dashboard?tab=${params.status === "ACTIVE" ? "active-swaps" : "history"}`,
    }
  });

  revalidatePath('/dashboard');
  return updatedSwap;
}

/**
 * Helper to find an existing active swap between two users.
 * Used for chat context.
 */
export async function findActiveSwapBetweenUsers(otherUserId: string) {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return null;

  return prisma.swap.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { teacherId: currentUserId, studentId: otherUserId },
        { teacherId: otherUserId, studentId: currentUserId },
      ],
    },
    select: {
      id: true,
    },
  });
}