import { type Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from 'next/server';

export type AppSession = Session & {
  user: Session['user'] & {
    id?: string;
    role?: string;
  };
  permissions?: string[];
  mfaRequired?: boolean;
  mustChangePassword?: boolean;
  sessionTimeoutMinutes?: number;
  lastActivityAt?: number;
  sessionExpired?: boolean;
};

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export async function requireAuthenticatedSession(): Promise<AppSession | NextResponse> {
  const session = (await getServerSession(authOptions)) as AppSession | null;

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  if (session.sessionExpired) {
    return NextResponse.json({ message: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  return session;
}

export async function requireAdminSession(): Promise<AppSession | NextResponse> {
  const session = await requireAuthenticatedSession();
  if (isNextResponse(session)) return session;

  if (session.user.role !== 'Super Admin') {
    return NextResponse.json({ message: 'Forbidden. Insufficient privileges.' }, { status: 403 });
  }

  return session;
}

export function hasPermission(session: AppSession, permissionId: string): boolean {
  return Boolean(session.permissions?.includes('all') || session.permissions?.includes(permissionId));
}

export async function requirePermission(permissionId: string): Promise<AppSession | NextResponse> {
  const session = await requireAuthenticatedSession();
  if (isNextResponse(session)) return session;

  if (!hasPermission(session, permissionId)) {
    return NextResponse.json({ message: 'Forbidden. Insufficient privileges.' }, { status: 403 });
  }

  return session;
}
