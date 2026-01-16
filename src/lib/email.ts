
import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        logger.warn("⚠️  RESEND_API_KEY is not set. Email simulation:");
        logger.log(`   To: ${to}`);
        logger.log(`   Subject: ${subject}`);
        return { success: true, simulated: true };
    }

    try {
        logger.log(`🚀 Attempting to send REAL email to ${to}...`);
        const data = await resend.emails.send({
            from: 'SkillTrade <notifications@skilltrade.solutions>',
            to,
            subject,
            html: wrapEmailTemplate(html),
            text: text || html.replace(/<[^>]*>?/gm, ''), // Simple fallback for text version
        });

        if (data.error) {
            logger.error(`❌ Resend API Error for ${to}:`, data.error);
            return { success: false, error: data.error };
        }

        logger.log(`✅ Email successfully accepted by Resend for ${to}: ${subject}`);
        return { success: true, data };
    } catch (error) {
        logger.error(`❌ Fatal Error sending email to ${to}:`, error);
        return { success: false, error };
    }
}

/**
 * Wraps email content in a consistent high-end branded template
 */
function wrapEmailTemplate(content: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skilltrade.solutions';
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SkillTrade Update</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        body { 
            margin: 0; 
            padding: 0; 
            min-width: 100%; 
            width: 100% !important; 
            height: 100% !important; 
            background-color: #f8fafc;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }
        
        .content { 
            width: 100%; 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #16161e;
        }

        .header { 
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
            padding: 60px 40px; 
            text-align: center;
        }

        .main-card {
            background-color: #ffffff;
            border-radius: 24px;
            margin: 40px 20px;
            padding: 48px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .logo-text {
            color: #1e293b;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 32px;
            text-align: center;
        }

        .eyebrow {
            color: #6366f1;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 12px;
            display: block;
        }

        .body-text {
            color: #475569;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .cta-button {
            display: inline-block;
            background: #6366f1;
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 15px;
            font-weight: 600;
            transition: background 0.2s;
        }

        .footer {
            padding: 32px 20px;
            text-align: center;
            background-color: #f8fafc;
        }

        .footer-text {
            color: #64748b;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 13px;
            margin: 8px 0;
        }

        .footer-links a {
            color: #6366f1;
            text-decoration: none;
            margin: 0 12px;
            font-size: 13px;
            font-weight: 600;
        }

        @media only screen and (max-width: 600px) {
            .main-card {
                padding: 32px 20px;
                margin: 20px 10px;
            }
        }
    </style>
</head>
<body>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="content" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <div class="main-card">
                                <div class="logo-text">SkillTrade</div>
                                <span class="eyebrow">Community Update</span>
                                <div class="body-text">
                                    ${content}
                                </div>
                                <div style="text-align: center; margin-top: 32px;">
                                    <a href="${appUrl}/dashboard" class="cta-button">Open Dashboard</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <div class="footer-links">
                                <a href="${appUrl}">Browse</a>
                                <a href="${appUrl}/dashboard">My Syncs</a>
                                <a href="${appUrl}/profile">Settings</a>
                            </div>
                            <p class="footer-text" style="margin-top: 24px;">&copy; ${currentYear} SkillTrade Solutions</p>
                            <p class="footer-text">Built for cooperative growth.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

