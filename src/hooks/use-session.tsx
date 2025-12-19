
'use client';

import { useState, useEffect } from 'react';

// This is a simplified session type. In a real app, it would be more complex.
interface Session {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    permissions: string[];
}

/**
 * A client-side hook to get session data from the session cookie.
 * This is a simplified implementation for the prototype.
 * In a real Next.js app, you'd likely use a library like next-auth
 * or a server-side `getSession` call in page components.
 */
export function useSession() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to read cookie from the browser
        const getCookie = (name: string): string | undefined => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        const sessionCookie = getCookie('zemen-admin-session');

        if (sessionCookie) {
            try {
                // The cookie value is URL-encoded JSON, so we need to decode and parse it.
                const decodedCookie = decodeURIComponent(sessionCookie);
                const parsedSession: Session = JSON.parse(decodedCookie);
                setSession(parsedSession);
            } catch (error) {
                console.error("Failed to parse session cookie:", error);
                setSession(null);
            }
        }
        setLoading(false);
    }, []);

    return { session, loading };
}
