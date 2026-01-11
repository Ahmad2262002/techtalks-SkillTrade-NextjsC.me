import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// /**
//  * Background job to send delayed email notifications
//  * This endpoint should be called by a cron job every 10-15 minutes
//  * 
//  * Setup with Vercel Cron:
//  * Add to vercel.json:
//  * {
//  *   "crons": [{
//  *     "path": "/api/cron/send-delayed-emails",
//  *     "schedule": "*/10  "
//        }]
//   }
//  **/
export async function GET(request: NextRequest) {
    try {
        // Security: Verify this is called by Vercel Cron or has auth token
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Synchronized Timing: 10 minutes delay for ALL unread notifications
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const unreadNotifications = await prisma.notification.findMany({
            where: {
                type: {
                    in: ["MESSAGE_RECEIVED", "APPLICATION_RECEIVED"]
                },
                isRead: false,
                createdAt: {
                    lte: tenMinutesAgo, // Created at least 10 minutes ago
                },
            },
            include: {
                user: true,
            },
            take: 50, // Process in batches
        });

        const emailsSent: string[] = [];
        const errors: string[] = [];

        for (const notification of unreadNotifications) {
            // Skip if user has no email
            const userEmail = notification.user?.email;
            if (!userEmail) continue;

            try {
                // Determine email content based on notification type
                let subject = "New Notification on SkillTrade";
                let title = "SkillTrade Notification";
                let actionText = "View Notification";

                if (notification.type === "MESSAGE_RECEIVED") {
                    subject = "You have unread messages on SkillTrade";
                    title = "💬 Unread Message";
                    actionText = "View Message";
                } else if (notification.type === "APPLICATION_RECEIVED") {
                    subject = "New talent application for your proposal";
                    title = "📩 New Application";
                    actionText = "Review Application";
                }

                await sendEmail({
                    to: userEmail,
                    subject: subject,
                    html: `
            <div style="font-family: 'Inter', Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%); padding: 28px; border-radius: 12px; border-left: 4px solid #6366f1; margin-bottom: 28px;">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 26px; font-weight: 900;">${title}</h2>
                <p style="color: #6b7280; margin: 0; font-size: 15px; line-height: 1.6;">${notification.message}</p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 10px; border: 1px solid #fbbf24; margin-bottom: 28px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⏰ Reminder:</strong> This notification has been waiting for your attention for over 10 minutes.
                </p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://skilltrade.solutions'}${notification.link}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: all 0.3s;">
                  ${actionText} →
                </a>
              </div>
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center; line-height: 1.6;">
                  You're receiving this email because you have unread notifications.<br/>
                  Log in to SkillTrade to manage your notification preferences.
                </p>
              </div>
            </div>
          `,
                });

                emailsSent.push(notification.id);

            } catch (error) {
                console.error(`Failed to send email for notification ${notification.id}:`, error);
                errors.push(notification.id);
            }
        }

        return NextResponse.json({
            success: true,
            processed: unreadNotifications.length,
            emailsSent: emailsSent.length,
            errors: errors.length,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Error in delayed email cron job:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
