'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function getNotifications(): Promise<any[]> {
    const userId = await getCurrentUserId();
    if (!userId) return []; // Return empty array if not auth

    // FIX: Use a raw query to explicitly filter out notifications where the 'type' is null.
    // This prevents a crash if there is corrupted data in the database.
    const notifications = await prisma.$queryRawUnsafe<any[]>(
        'SELECT * FROM "Notification" WHERE "userId" = $1 AND "type" IS NOT NULL ORDER BY "createdAt" DESC LIMIT 20',
        userId
    );

    return notifications;
}

export async function markNotificationAsRead(notificationId: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found");
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
}

export async function markAllNotificationsAsRead() {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}