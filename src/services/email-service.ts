
'use server';

import { logActivity } from '@/lib/activity-log';

interface EmailResult {
  success: boolean;
  message: string;
}

// NOTE: Nodemailer setup has been commented out to allow development without
// real SMTP credentials. The email content will be logged to the console instead.
/*
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        // In a production environment with valid certificates, this should be `true`.
        // For internal servers with self-signed certs, `false` is often needed.
        rejectUnauthorized: false
    }
});
*/

/**
 * Sends an email using the configured SMTP gateway.
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param html The HTML body of the email.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  try {
    console.log('--- DEV EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: \n${html}`);
    console.log('-----------------');

    await logActivity({
        userEmail: 'system',
        action: 'SMS_SENT', // Keeping this action name for consistency
        status: 'Success',
        details: `Email with subject "${subject}" sent to ${to}.`,
    });
    return { success: true, message: "Email logged to console for development." };
  } catch (error: any) {
    console.error(`[Email Service] Error sending email to ${to}:`, error);
    return { success: false, message: `An unexpected error occurred while sending the email.` };
  }
}
