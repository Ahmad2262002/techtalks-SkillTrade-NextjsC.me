'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skilltrade.solutions';

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
      link: `/dashboard?tab=active-swaps`,
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
        <p style="font-size: 18px; color: #1e293b; font-weight: 600;">You have a new application!</p>
        <p>Someone is interested in your proposal: <strong>${proposal.title}</strong></p>
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 24px 0;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em;">Pitch from applicant</p>
          <p style="margin: 0; font-style: italic; color: #334155;">"${input.pitchMessage}"</p>
        </div>
        <p>Head over to your dashboard to review their profile and start the sync.</p>
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
        link: params.status === "ACCEPTED" ? `/dashboard?tab=active-swaps` : `/dashboard?tab=browse`,
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
          <p style="font-size: 18px; color: #1e293b; font-weight: 600;">Update on your application 📝</p>
          <p>Your application for <strong>${application.proposal.title}</strong> has been <strong>${params.status.toLowerCase()}</strong>.</p>
          ${isAccepted
            ? `<div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                 <p style="margin: 0; color: #166534; font-weight: 700; font-size: 18px;">Congratulations! 🎉</p>
                 <p style="margin: 12px 0 0 0; color: #166534; font-size: 15px; line-height: 1.5;">Your skills have found a match. You can now start collaborating and chatting with your partner.</p>
               </div>`
            : `<div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0;">
                 <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">Don't lose momentum. There are many other experts waiting to sync skills with you. Keep exploring!</p>
               </div>`
          }
        `
      });
    }
  }

  return updatedApplication;
}