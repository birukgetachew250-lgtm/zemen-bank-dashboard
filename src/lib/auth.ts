

'use server';

import 'server-only';
import { db } from './db';
import { cookies } from 'next/headers';
import type { Role } from '@/app/(main)/roles/page';

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
    const session: Session = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        permissions: [], // This was missing, causing the redirect loop.
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
