
'use client';

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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
              © {new Date().getFullYear()} Zemen Bank. All rights reserved.
            </footer>
          </main>
        </div>
      </div>
  );
}
