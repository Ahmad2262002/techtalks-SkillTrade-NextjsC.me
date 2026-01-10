'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { SwapStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skilltrade.solutions';

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
  const student = await prisma.user.findUnique({ where: { id: application.applicantId } });
  const teacher = await prisma.user.findUnique({ where: { id: application.proposal.ownerId } });

  await prisma.notification.create({
    data: {
      userId: application.applicantId,
      type: "SWAP_STARTED",
      message: `Sync started! Your request for "${application.proposal.title}" was accepted.`,
      link: `/dashboard?tab=active-swaps`,
    },
  });

  // Send Email to Student
  if (student?.email) {
    await sendEmail({
      to: student.email,
      subject: `Sync Started: ${application.proposal.title}`,
      html: `
        <h2 style="color: #111827; margin-top: 0;">It's a Match! 🎭</h2>
        <p>Congratulations! Your request to learn <strong>${application.proposal.title}</strong> has been accepted by <strong>${teacher?.name}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600; color: #4b5563;">Next Steps:</p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #4b5563;">
            <li>Navigate to your dashboard</li>
            <li>Open the "Syncs" tab to find your new chat</li>
            <li>Say hello and coordinate your skill exchange!</li>
          </ul>
        </div>
        <p><a href="${appUrl}/dashboard?tab=active-swaps" style="color: #6366f1; font-weight: bold; text-decoration: underline;">View your active syncs</a></p>
      `
    });
  }

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
    const partner = await prisma.user.findUnique({ where: { id: partnerId } });

    await prisma.notification.create({
      data: {
        userId: partnerId,
        type: "SWAP_COMPLETED",
        message: `Congratulations! Your sync for "${swap.proposal.title}" is now COMPLETE.`,
        link: `/dashboard?tab=history`,
      }
    });

    if (partner?.email) {
      await sendEmail({
        to: partner.email,
        subject: `Sync Completed: ${swap.proposal.title}`,
        html: `
          <h2 style="color: #111827; margin-top: 0;">Mission Accomplished! 🏆</h2>
          <p>Fantastic news! Your skill exchange for <strong>${swap.proposal.title}</strong> has been marked as complete by both parties.</p>
          <p>We hope you had a great experience learning and sharing. Don't forget to leave a review for your partner if you haven't already!</p>
          <p><a href="${appUrl}/dashboard?tab=history" style="color: #6366f1; font-weight: bold; text-decoration: underline;">See your history & leave a review</a></p>
        `
      });
    }
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
  const partner = await prisma.user.findUnique({ where: { id: partnerId } });

  await prisma.notification.create({
    data: {
      userId: partnerId,
      type: "SWAP_CANCELLED",
      message: `The sync for "${swap.proposal.title}" has been cancelled by the partner.`,
      link: `/dashboard?tab=browse`,
    }
  });

  if (partner?.email) {
    await sendEmail({
      to: partner.email,
      subject: `Sync Cancelled: ${swap.proposal.title}`,
      html: `
        <p>Hello,</p>
        <p>The sync for <strong>${swap.proposal.title}</strong> was recently cancelled by your partner.</p>
        <p>The proposal has been re-opened, and you can continue browsing for other exchange opportunities.</p>
        <p><a href="${appUrl}/dashboard?tab=browse" style="color: #6366f1; font-weight: bold; text-decoration: underline;">Browse more proposals</a></p>
      `
    });
  }

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