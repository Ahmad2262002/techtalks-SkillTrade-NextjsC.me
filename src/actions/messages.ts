'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { MediaType } from "@prisma/client";

export type MessageMediaType = "IMAGE" | "VIDEO" | "DOCUMENT";

export async function sendMessage(params: {
    swapId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: MessageMediaType;
}) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const swap = await prisma.swap.findUnique({
        where: { id: params.swapId },
        include: {
            teacher: true,
            student: true,
        },
    });

    if (!swap) throw new Error("Swap not found");

    // Verify user is part of the swap
    if (swap.teacherId !== userId && swap.studentId !== userId) {
        throw new Error("Not authorized");
    }

    const receiverId = swap.teacherId === userId ? swap.studentId : swap.teacherId;
    const receiver = swap.teacherId === userId ? swap.student : swap.teacher;

    const message = await prisma.message.create({
        data: {
            content: params.content,
            senderId: userId,
            receiverId: receiverId,
            swapId: params.swapId,
            mediaUrl: params.mediaUrl,
            mediaType: params.mediaType as MediaType,
        },
    });

    // Create notification for receiver
    const notification = await prisma.notification.create({
        data: {
            userId: receiverId,
            type: "MESSAGE_RECEIVED",
            message: `New message from ${swap.teacherId === userId ? swap.teacher.name : swap.student.name}`,
            link: `/dashboard?tab=active-swaps&swapId=${params.swapId}`,
        },
    });

    // OFFLINE EMAIL LOGIC (WITHOUT LAST SEEN COLUMN)
    // Check for recent activity: last read notification or last sent message
    const lastActivity = await prisma.$transaction([
        prisma.notification.findFirst({
            where: { userId: receiverId, isRead: true },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
        }),
        prisma.message.findFirst({
            where: { senderId: receiverId },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
        })
    ]);

    const latestTimestamp = [
        lastActivity[0]?.createdAt,
        lastActivity[1]?.createdAt
    ].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const isOffline = !latestTimestamp || latestTimestamp < fifteenMinutesAgo;

    if (isOffline && receiver.email) {
        // Only send if no unread email notification was sent recently for this user
        // (to avoid spamming on every message in a burst)
        // For simplicity, we just send it if offline.
        await sendEmail({
            to: receiver.email,
            subject: `New message from ${swap.teacherId === userId ? swap.teacher.name : swap.student.name}`,
            html: `
                <p>You have a new message on SkillTrade:</p>
                <blockquote style="border-left: 4px solid #6366f1; padding-left: 15px; margin: 15px 0;">
                    ${params.content}
                </blockquote>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=active-swaps&swapId=${params.swapId}" style="color: #6366f1; font-weight: bold;">Reply on SkillTrade</a></p>
            `,
            text: `New message from ${swap.teacherId === userId ? swap.teacher.name : swap.student.name}: ${params.content}`
        });
    }

    return message;
}

export async function getSwapMessages(swapId: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const swap = await prisma.swap.findUnique({
        where: { id: swapId },
    });

    if (!swap) throw new Error("Swap not found");
    if (swap.teacherId !== userId && swap.studentId !== userId) {
        throw new Error("Not authorized");
    }

    return prisma.message.findMany({
        where: { swapId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: true,
        },
    });
}

export async function markMessagesAsRead(swapId: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    return prisma.message.updateMany({
        where: {
            swapId,
            receiverId: userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
}
