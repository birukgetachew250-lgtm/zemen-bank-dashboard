import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuthenticatedSession } from '@/lib/auth-utils';

async function handleToggleMfa(req: Request) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const { mfaEnabled, userId, email } = body;

    if (typeof mfaEnabled !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid `mfaEnabled` value provided.' },
        { status: 400 }
      );
    }

    if (userId) {
      await db.user.update({
        where: { id: Number(userId) },
        data: { mfaEnabled },
      });
    } else {
      const targetEmail = email || (session.user.email as string);
      await db.user.update({
        where: { email: targetEmail },
        data: { mfaEnabled },
      });
    }

    return NextResponse.json({
      success: true,
      mfaEnabled,
      channel: mfaEnabled ? 'Email OTP / Authenticator App' : 'Disabled',
      message: 'MFA status updated successfully',
    });
  } catch (error) {
    console.error('Failed to update MFA status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleToggleMfa(req);
}

export async function PATCH(req: Request) {
  return handleToggleMfa(req);
}

export async function PUT(req: Request) {
  return handleToggleMfa(req);
}
