
'use server';

import { logActivity, type ActivityLogAction } from '@/lib/activity-log';
import nodemailer from 'nodemailer';

interface EmailResult {
  success: boolean;
  message: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // For port 587, secure should be false and STARTTLS is used by default.
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        // Allow controlling certificate validation via env var. Default: allow self-signed (false).
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true' ? true : false,
    }
});

/**
 * Sends an email using the configured SMTP gateway.
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param html The HTML body of the email.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const mailOptions = {
    from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_SENDER_EMAIL}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log(`[Email Service] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    
    const action: ActivityLogAction = subject.includes('Login Code') || subject.includes('OTP') ? 'OTP_EMAIL_SENT' : 'WELCOME_EMAIL_SENT';

    await logActivity({
        userEmail: 'system',
        action: action,
        status: 'Success',
        details: `Email with subject "${subject}" sent to ${to}.`,
    });
    return { success: true, message: "Email sent successfully." };
  } catch (error: any) {
    console.error(`[Email Service] Error sending email to ${to}:`, error);
    
    await logActivity({
        userEmail: 'system',
        action: 'EMAIL_SEND_FAILURE',
        status: 'Failure',
        details: `Failed to send email to ${to}. Error: ${error.message}`,
    });
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
}
