"use server";

import { sendEmail } from "@/lib/email";

interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export async function submitContactForm(formData: ContactFormData) {
    try {
        // Validate inputs
        if (!formData.name || !formData.email || !formData.message) {
            return { success: false, error: "All fields are required" };
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return { success: false, error: "Invalid email address" };
        }

        const contactEmail = process.env.CONTACT_EMAIL || "ahmadalkadri2002@gmail.com";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skilltrade.solutions';

        // Send email to site owner
        const result = await sendEmail({
            to: contactEmail,
            subject: `New Contact Form Submission from ${formData.name}`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif;">
                    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%); padding: 24px; border-radius: 12px; border-left: 4px solid #6366f1; margin-bottom: 24px;">
                        <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px; font-weight: 900;">
                            📬 New Contact Message
                        </h2>
                        <p style="color: #6b7280; margin: 0; font-size: 14px; font-weight: 600;">
                            Someone reached out through your website
                        </p>
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding: 8px 0;">
                                    <strong style="color: #374151; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">From:</strong>
                                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 700;">${formData.name}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">
                                    <strong style="color: #374151; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email:</strong>
                                    <p style="margin: 4px 0 0 0;">
                                        <a href="mailto:${formData.email}" style="color: #6366f1; text-decoration: none; font-weight: 600; font-size: 15px;">${formData.email}</a>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0;">
                                    <strong style="color: #374151; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Received:</strong>
                                    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 24px; border-left: 4px solid #6366f1; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Message:</h3>
                        <p style="white-space: pre-wrap; line-height: 1.8; color: #374151; margin: 0; font-size: 15px;">${formData.message}</p>
                    </div>
                    
                    <div style="padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 1px solid #fbbf24;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                            <strong style="font-size: 16px;">💡 Quick Reply:</strong><br/>
                            Click here to respond: <a href="mailto:${formData.email}?subject=Re: Your message to SkillTrade" style="color: #6366f1; font-weight: 700; text-decoration: none;">${formData.email}</a>
                        </p>
                    </div>
                </div>
            `,
        });

        if (!result.success) {
            console.error("Failed to send contact email:", result.error);
            return { success: false, error: "Failed to send message. Please try again later." };
        }

        return { success: true };
    } catch (error) {
        console.error("Contact form error:", error);
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}
