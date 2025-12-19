
'use server';

import 'server-only';
import { db } from './db';
import { cookies } from 'next/headers';
import type { Role } from '@/app/(main)/roles/page';
import { getPermissionForPath } from '@/lib/permissions';
import { redirect } from 'next/navigation';

interface Session {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    permissions: string[];
}

// In a real app, this would be a secure, database-backed session store.
// For this prototype, we'll store the session in a cookie.
const sessionCookieName = 'zemen-admin-session';


export async function createSession(user: any) {
    const roleData = db.prepare('SELECT permissions FROM roles WHERE name = ?').get(user.role) as Role | undefined;
    
    // The permissions are stored as a JSON string in the DB. It needs to be parsed.
    const permissions = roleData ? JSON.parse(roleData.permissions) : [];
    
    // Add "view-dashboard" to all roles by default if it doesn't exist
    if (!permissions.includes('view-dashboard')) {
        permissions.push('view-dashboard');
    }

    const session: Session = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        permissions,
    };

    cookies().set(sessionCookieName, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });
}

export async function getSession(): Promise<Session | null> {
    const sessionCookie = cookies().get(sessionCookieName);

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie.value);
        return session;
    } catch (error) {
        console.error('Failed to parse session cookie:', error);
        return null;
    }
}

export async function deleteSession() {
    cookies().delete(sessionCookieName);
}


export async function verifySessionAndPermissions(pathname: string) {
    const session = await getSession();

    if (!session) {
        return; // Let middleware handle redirect for no session
    }

    const requiredPermission = getPermissionForPath(pathname);
    if (!requiredPermission) {
        return; // No specific permission required for this path
    }

    const userPermissions = session.permissions || [];

    // The "Admin" role in our seed data has "approve-all", which we treat as a super-user permission.
    const isSuperAdmin = userPermissions.includes('approve-all');

    if (!isSuperAdmin && !userPermissions.includes(requiredPermission)) {
        redirect('/unauthorized');
    }
}
