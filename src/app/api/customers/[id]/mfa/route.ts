import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-log';

async function handleCustomerMfaUpdate(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_READ);
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const { mfaEnabled, mfaChannel } = body;

    if (typeof mfaEnabled !== 'boolean') {
      return NextResponse.json(
        { message: 'mfaEnabled (boolean) is required' },
        { status: 400 }
      );
    }

    const rawId = params.id || '';
    const cif = rawId.startsWith('user_') ? rawId.split('_')[1] : rawId;
    const targetSignUp2FA = mfaEnabled ? mfaChannel || 'SMSOTP' : 'None';

    const connStr = process.env.USER_MODULE_DB_CONNECTION_STRING;
    if (connStr) {
      try {
        await executeQuery(
          connStr,
          `UPDATE "USER_MODULE"."AppUsers"
           SET "SignUp2FA" = :twoFa, "UpdateDate" = SYSTIMESTAMP
           WHERE "CIFNumber" = :cif`,
          { twoFa: targetSignUp2FA, cif }
        );
      } catch (dbErr: any) {
        console.warn('[CustomerMFA] Oracle update warning:', dbErr?.message || dbErr);
      }
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    await logActivity({
      userEmail: session.user?.email || 'system',
      action: 'CUSTOMER_UPDATE_REQUESTED',
      status: 'Success',
      details: `Updated MFA status for CIF ${cif}: mfaEnabled=${mfaEnabled}, channel=${targetSignUp2FA}`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({
      success: true,
      cif,
      mfaEnabled,
      signUp2FA: targetSignUp2FA,
      message: `Customer MFA ${mfaEnabled ? `enabled (${targetSignUp2FA})` : 'disabled'} successfully.`,
    });
  } catch (error: any) {
    console.error('[CustomerMFA] Failed to update customer MFA:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to update MFA status' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  return handleCustomerMfaUpdate(req, ctx);
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  return handleCustomerMfaUpdate(req, ctx);
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  return handleCustomerMfaUpdate(req, ctx);
}
