
'use server';

import nodemailer from 'nodemailer';
import { logActivity } from '@/lib/activity-log';

interface EmailResult {
  success: boolean;
  message: string;
}

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
    console.log(`Attempting to send email to ${to}`);
    
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    // You might want a specific log action for emails, but for now, we'll reuse SMS_SENT logic.
    // await logActivity({
    //     userEmail: 'system',
    //     action: 'EMAIL_SENT',
    //     status: 'Success',
    //     details: `Email with subject "${subject}" sent to ${to}.`,
    // });
    return { success: true, message: "Email sent successfully." };

  } catch (error: any) {
    console.error(`Unexpected error during email sending to ${to}`, error);
    // await logActivity({
    //     userEmail: 'system',
    //     action: 'EMAIL_SENT',
    //     status: 'Failure',
    //     details: `Failed to send email to ${to}. Error: ${error.message}`,
    // });
    return { success: false, message: `An unexpected error occurred while sending the email.` };
  }
}
