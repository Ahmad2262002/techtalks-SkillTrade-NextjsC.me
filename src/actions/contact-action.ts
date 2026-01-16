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
                <div style="font-family: sans-serif;">
                    <p style="font-size: 18px; color: #1e293b; font-weight: 600;">New Contact Message 📬</p>
                    <p>Someone reached out via the website contact form.</p>
                    <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${formData.name}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #6366f1;">${formData.email}</a></p>
                        <p style="margin: 0 0 10px 0;"><strong>Received:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
                        <p style="margin: 0; font-weight: 700; text-transform: uppercase; font-size: 12px; color: #64748b; letter-spacing: 0.1em; margin-bottom: 8px;">Message:</p>
                        <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #334155;">${formData.message}</p>
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
