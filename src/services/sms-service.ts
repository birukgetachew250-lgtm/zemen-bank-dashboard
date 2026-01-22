
'use server';

import { logActivity } from '@/lib/activity-log';

interface SmsResult {
  success: boolean;
  message: string;
}

/**
 * Sends an SMS using the configured gateway.
 * @param recipientPhoneNumber The phone number to send the SMS to.
 * @param code The activation or OTP code.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function sendSms(recipientPhoneNumber: string, code: string): Promise<SmsResult> {
  const apiUrl = process.env.SMS_API_URL;
  const username = process.env.SMS_USERNAME;
  const password = process.env.SMS_PASSWORD;
  const sourceAddress = process.env.SMS_SOURCE_ADDRESS;
  const coding = process.env.SMS_CODING;
  const priority = process.env.SMS_PRIORITY;

  if (!apiUrl || !username || !password || !sourceAddress) {
    console.error("SMS service is not configured. Please check environment variables.");
    return { success: false, message: "SMS service is not configured on the server." };
  }

  const content = `Thank You for using ZemenMobileApp. Please keep verification code private. Your activation code is ${code}.`;
  
  const body = new URLSearchParams({
    username,
    password,
    to: recipientPhoneNumber,
    from: sourceAddress,
    coding: coding || '8',
    priority: priority || '3',
    content,
  });

  try {
    console.log(`Attempting to send SMS to ${recipientPhoneNumber}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const resultText = await response.text();
    
    if (response.ok) {
      console.log(`SMS API SUCCESS for ${recipientPhoneNumber}: ${resultText}`);
      await logActivity({
            userEmail: 'system',
            action: 'SMS_SENT',
            status: 'Success',
            details: `SMS sent to ${recipientPhoneNumber}. Response: ${resultText}`,
        });
      return { success: true, message: "SMS sent successfully." };
    } else {
      console.error(`SMS API FAILED with status ${response.status}. Content: ${resultText}`);
      await logActivity({
            userEmail: 'system',
            action: 'SMS_SENT',
            status: 'Failure',
            details: `Failed to send SMS to ${recipientPhoneNumber}. Status: ${response.status}, Response: ${resultText}`,
        });
      return { success: false, message: `SMS gateway returned an error: ${response.statusText}` };
    }
  } catch (error: any) {
    console.error(`Unexpected error during SMS sending to ${recipientPhoneNumber}`, error);
    await logActivity({
        userEmail: 'system',
        action: 'SMS_SENT',
        status: 'Failure',
        details: `Failed to send SMS to ${recipientPhoneNumber}. Error: ${error.message}`,
    });
    return { success: false, message: `An unexpected network error occurred.` };
  }
}
