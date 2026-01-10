
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️  RESEND_API_KEY is not set. Email simulation:");
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        return { success: true, simulated: true };
    }

    try {
        console.log(`🚀 Attempting to send REAL email to ${to}...`);
        const data = await resend.emails.send({
            from: 'SkillTrade <notifications@skilltrade.solutions>',
            to,
            subject,
            html: wrapEmailTemplate(html),
            text: text || html.replace(/<[^>]*>?/gm, ''), // Simple fallback for text version
        });

        if (data.error) {
            console.error(`❌ Resend API Error for ${to}:`, data.error);
            return { success: false, error: data.error };
        }

        console.log(`✅ Email successfully accepted by Resend for ${to}: ${subject}`);
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Fatal Error sending email to ${to}:`, error);
        return { success: false, error };
    }
}

/**
 * Wraps email content in a consistent branded template
 */
function wrapEmailTemplate(content: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skilltrade.solutions';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <title>SkillTrade Notification</title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }

                table, td {
                    border-collapse: collapse !important;
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }

                img {
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                    -ms-interpolation-mode: bicubic;
                }

                .email-container {
                    max-width: 600px !important;
                    margin: 0 auto !important;
                }

                @media screen and (max-width: 600px) {
                    .email-container {
                        width: 100% !important;
                    }
                    .padding-mobile {
                        padding: 30px 20px !important;
                    }
                }
            </style>
        </head>
        <body style="background-color: #f3f4f6; padding: 40px 0;">
            <!--[if mso]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <div class="email-container" style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); overflow: hidden; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2);">
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                            <tr>
                                <td>
                                    <img src="${appUrl}/favicon.ico" alt="SkillTrade" width="28" height="28" style="vertical-align: middle; border-radius: 6px;" />
                                </td>
                                <td style="padding-left: 10px;">
                                    <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; vertical-align: middle;">
                                        SkillTrade
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <style>
                    body { background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
                    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; padding-top: 40px; }
                    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                    .header { padding: 40px 0; text-align: center; background: linear-gradient(135deg, #2563eb, #7c3aed); }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
                    .content { padding: 40px; color: #1e293b; line-height: 1.6; }
                    .content h2 { color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 20px; }
                    .footer { padding: 40px; text-align: center; color: #64748b; font-size: 12px; }
                    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 20px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
                    .nav-links { margin-top: 20px; border-top: 1px solid #e2e8f0; pt-20; }
                    .nav-links a { color: #2563eb; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 11px; text-transform: uppercase; }
                    .quote { border-left: 4px solid #2563eb; padding-left: 20px; margin: 20px 0; font-style: italic; color: #475569; background: #f1f5f9; padding: 15px; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="main">
                        <div class="header">
                            <h1>SKILL<span style="opacity:0.8">TRADE</span></h1>
                        </div>
                        <div class="content">
                            ${content}
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${appUrl}/dashboard" class="btn">Go to Dashboard</a>
                            </div>
                        </div>
                        <div class="footer">
                             <p>You&apos;re receiving this because you&apos;re a member of SkillTrade.</p>
                             <p>&copy; ${new Date().getFullYear()} SkillTrade. All rights reserved.</p>
                             <div class="nav-links">
                                <a href="${appUrl}">Home</a>
                                <a href="${appUrl}/dashboard">Dashboard</a>
                                <a href="${appUrl}/#contact">Support</a>
                             </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
}
