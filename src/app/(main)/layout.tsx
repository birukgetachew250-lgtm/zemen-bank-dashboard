'use client';

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { signOut } from 'next-auth/react';

const LAST_ACTIVITY_KEY = 'zemen:lastActivityAt';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Keep throttle state across effect re-runs to avoid interaction-triggered refresh loops.
  const lastTouchForTokenRef = useRef(0);
  const lastActivityWriteRef = useRef(0);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.replace('/login');
      return;
    }

    if ((session as any)?.mfaRequired && pathname !== '/login/verify-otp') {
      router.replace(`/login/verify-otp?email=${encodeURIComponent(session.user?.email || '')}`);
      return;
    }
  }, [status, session, router, pathname]);

  const timeoutMinutes = Math.max(1, Number((session as any)?.sessionTimeoutMinutes || 30));
  const sessionExpired = Boolean((session as any)?.sessionExpired);
  const sessionLastActivityAt = Number((session as any)?.lastActivityAt || Date.now());

  useEffect(() => {
    if (status !== 'authenticated' || !session) {
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const tokenRefreshInterval = Math.max(60 * 1000, (timeoutMinutes * 60 * 1000) / 2);

    const getStoredActivity = () => {
      const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
      const parsed = raw ? Number(raw) : NaN;
      return Number.isFinite(parsed) ? parsed : Date.now();
    };

    // Initialize localStorage with session's lastActivityAt once if storage is empty/stale.
    const rawStored = localStorage.getItem(LAST_ACTIVITY_KEY);
    const parsedStored = rawStored ? Number(rawStored) : NaN;
    if (!Number.isFinite(parsedStored) || parsedStored < sessionLastActivityAt) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(sessionLastActivityAt));
    }

    const logoutForInactivity = async () => {
      await signOut({ redirect: false });
      router.replace('/login?reason=session-timeout');
      router.refresh();
    };

    const touchActivity = () => {
      const now = Date.now();

      // Avoid writing localStorage for every tiny interaction event.
      if (now - lastActivityWriteRef.current > 1000) {
        lastActivityWriteRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      }

      if (now - lastTouchForTokenRef.current > tokenRefreshInterval) {
        lastTouchForTokenRef.current = now;
        update({ touchSessionAt: now }).catch(() => {
          // Ignore touch update errors; timer check still protects local session.
        });
      }
    };

    const checkTimeout = () => {
      const lastActivity = getStoredActivity();
      if (Date.now() - lastActivity > timeoutMs) {
        void logoutForInactivity();
      }
    };

    if (sessionExpired) {
      void logoutForInactivity();
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_KEY) {
        checkTimeout();
      }
    };

    // Exclude mousemove to prevent high-frequency interaction churn.
    const activityEvents: Array<keyof WindowEventMap> = ['click', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    const interval = window.setInterval(checkTimeout, 30000);

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, touchActivity, { passive: true });
    });
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, touchActivity);
      });
      window.removeEventListener('storage', onStorage);
    };
  }, [
    status,
    session?.user?.email,
    timeoutMinutes,
    sessionExpired,
    sessionLastActivityAt,
    update,
    router,
  ]);

  if (status === 'loading' || !session || (session as any)?.mfaRequired) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const user = session?.user;
  const userPermissions = (session as any)?.permissions || [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userPermissions={userPermissions} />
      <div className="flex-1 flex flex-col h-screen">
        <Header user={user} userPermissions={userPermissions} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative overflow-y-auto">
          <Watermark />
          {children}
          <footer className="relative z-10 text-center text-xs text-muted-foreground pt-4 mt-auto">
             {new Date().getFullYear()} Zemen Bank. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
}