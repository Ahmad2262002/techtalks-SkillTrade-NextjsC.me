'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export async function createApplication(input: {
  proposalId: string;
  pitchMessage: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // --- FIX START: Fetch Proposal first ---
  const proposal = await prisma.proposal.findUnique({
    where: { id: input.proposalId },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  // CHECK 1: You cannot apply to your own proposal
  if (proposal.ownerId === userId) {
    throw new Error("You cannot apply to your own proposal");
  }

  // CHECK 2: You cannot apply twice
  const existingApplication = await prisma.application.findUnique({
    where: {
      proposalId_applicantId: {
        proposalId: input.proposalId,
        applicantId: userId,
      },
    },
  });

  if (existingApplication) {
    throw new Error("You have already applied to this proposal");
  }
  // --- FIX END ---

  const application = await prisma.application.create({
    data: {
      proposalId: input.proposalId,
      applicantId: userId,
      pitchMessage: input.pitchMessage,
    },
  });

  // Notify proposal owner
  await prisma.notification.create({
    data: {
      userId: proposal.ownerId,
      type: "APPLICATION_RECEIVED",
      message: `New application for "${proposal.title}"`,
      link: `/dashboard?tab=applications`,
    },
  });

  // Fetch owner email for instant notification
  const owner = await prisma.user.findUnique({
    where: { id: proposal.ownerId },
    select: { email: true }
  });

  if (owner?.email) {
    await sendEmail({
      to: owner.email,
      subject: `New Application: ${proposal.title}`,
      html: `
        <p>You have a new application for your proposal: <strong>${proposal.title}</strong></p>
        <p>Message from applicant:</p>
        <blockquote style="border-left: 4px solid #6366f1; padding-left: 15px; margin: 15px 0;">
          ${input.pitchMessage}
        </blockquote>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=applications" style="color: #6366f1; font-weight: bold;">Review application in Dashboard</a></p>
      `
    });
  }

  return application;
}

export async function listApplicationsForProposal(proposalId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal || proposal.ownerId !== userId) {
    throw new Error("Not authorized to view applications");
  }

  return prisma.application.findMany({
    where: { proposalId },
    include: { applicant: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listMyApplications() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.application.findMany({
    where: { applicantId: userId },
    include: {
      proposal: {
        include: {
          owner: true,
          offeredSkills: true,
          neededSkills: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(params: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
    include: {
      proposal: true,
    },
  });

  if (!application || application.proposal.ownerId !== userId) {
    throw new Error("Application not found");
  }

  const updatedApplication = await prisma.application.update({
    where: { id: params.applicationId },
    data: { status: params.status },
  });

  // Notify applicant
  if (params.status === "ACCEPTED" || params.status === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: params.status === "ACCEPTED" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED",
        message: `Your application for "${application.proposal.title}" was ${params.status.toLowerCase()}`,
        link: params.status === "ACCEPTED" ? `/dashboard?tab=active-swaps` : `/dashboard?tab=my-proposals`,
      },
    });

    // Fetch applicant email for instant notification
    const applicant = await prisma.user.findUnique({
      where: { id: application.applicantId },
      select: { email: true }
    });

    if (applicant?.email) {
      const isAccepted = params.status === "ACCEPTED";
      await sendEmail({
        to: applicant.email,
        subject: `Application ${isAccepted ? 'Accepted' : 'Rejected'}: ${application.proposal.title}`,
        html: `
          <p>Your application for <strong>${application.proposal.title}</strong> has been <strong>${params.status.toLowerCase()}</strong>.</p>
          ${isAccepted
            ? `<p>Congratulations! You can now start chatting and collaborate on this project.</p>
               <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=active-swaps" style="color: #6366f1; font-weight: bold;">Go to Swaps</a></p>`
            : `<p>Don't worry, there are many other opportunities waiting for you.</p>
               <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=browse" style="color: #6366f1; font-weight: bold;">Browse more proposals</a></p>`
          }
        `
      });
    }
  }

  return updatedApplication;
}