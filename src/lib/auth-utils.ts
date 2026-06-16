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

/**
 * Require the user to be authenticated and their session to be valid (not expired).
 * Returns the session or a 401/403 NextResponse.
 */
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

/**
 * @deprecated Use requirePermission() with a specific PERMISSIONS constant instead.
 * Require the user to have the 'Super Admin' role.
 */
export async function requireAdminSession(): Promise<AppSession | NextResponse> {
  const session = await requireAuthenticatedSession();
  if (isNextResponse(session)) return session;

  if (session.user.role !== 'Super Admin') {
    return NextResponse.json({ message: 'Forbidden. Insufficient privileges.' }, { status: 403 });
  }

  return session;
}

/**
 * Check whether the given session holds a specific permission.
 * Super Admin sessions (permissions = ['all']) always pass.
 */
export function hasPermission(session: AppSession, permissionId: string): boolean {
  return Boolean(session.permissions?.includes('all') || session.permissions?.includes(permissionId));
}

/**
 * Check whether the given session holds AT LEAST ONE of the supplied permissions.
 * Useful when multiple different permissions should grant access to the same route.
 * Super Admin sessions (permissions = ['all']) always pass.
 */
export function hasAnyPermission(session: AppSession, permissionIds: string[]): boolean {
  if (session.permissions?.includes('all')) return true;
  return permissionIds.some((id) => session.permissions?.includes(id));
}

/**
 * Require the authenticated session to hold a specific permission.
 * Returns the session or a 401/403 NextResponse.
 *
 * @example
 *   const session = await requirePermission(PERMISSIONS.USERS_CREATE);
 *   if (session instanceof NextResponse) return session;
 */
export async function requirePermission(permissionId: string): Promise<AppSession | NextResponse> {
  const session = await requireAuthenticatedSession();
  if (isNextResponse(session)) return session;

  if (!hasPermission(session, permissionId)) {
    return NextResponse.json(
      { message: 'Forbidden. You do not have permission to perform this action.' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Require the authenticated session to hold AT LEAST ONE of the supplied permissions.
 * Returns the session or a 401/403 NextResponse.
 *
 * @example
 *   const session = await requireAnyPermission([PERMISSIONS.USERS_SUSPEND, PERMISSIONS.USERS_UNLOCK]);
 *   if (session instanceof NextResponse) return session;
 */
export async function requireAnyPermission(permissionIds: string[]): Promise<AppSession | NextResponse> {
  const session = await requireAuthenticatedSession();
  if (isNextResponse(session)) return session;

  if (!hasAnyPermission(session, permissionIds)) {
    return NextResponse.json(
      { message: 'Forbidden. You do not have permission to perform this action.' },
      { status: 403 }
    );
  }

  return session;
}
