import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import crypto from 'crypto';
import { executeQuery } from '@/lib/oracle-db';
import { sendSms } from '@/services/sms-service';

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_PIN_RESET);
  if (session instanceof NextResponse) return session;

  try {
    const { cif, phone } = await req.json();
    if (!cif) return NextResponse.json({ message: 'CIF is required' }, { status: 400 });

    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newPinHash = crypto.createHash('sha256').update(newPin).digest('hex');

    const updateSecurityQuery = `
      UPDATE SECURITY_MODULE."UserSecurities"
      SET "PinHash" = :pinHash,
          "OnPinReset" = 1,
          "FailedAttempts" = 0,
          "IsLocked" = 0,
          "UnlockedTime" = :unlockedTime,
          "UpdateDate" = SYSTIMESTAMP,
          "UpdateUser" = :updateUser
      WHERE "CIFNumber" = :cif`;

    await executeQuery(process.env.SECURITY_MODULE_DB_CONNECTION_STRING, updateSecurityQuery, {
      pinHash: newPinHash,
      unlockedTime: new Date(),
      updateUser: session.user.email || 'system',
      cif,
    });

    let smsResult = { success: false, message: 'No phone provided' };
    if (phone) {
      const smsMessage = `Your new temporary PIN is ${newPin}. Please change it after login.`;
      smsResult = await sendSms(phone, smsMessage);
    }

    return NextResponse.json({ success: true, sms: smsResult, message: 'PIN reset successful' });
  } catch (error: any) {
    console.error('PIN reset failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
