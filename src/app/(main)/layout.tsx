
'use client';

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Mock permissions for now as we can't easily fetch them on the client
// In a real-world app, this would likely be part of the session token
const getPermissions = (role: string): string[] => {
    if (role === 'Super Admin') {
        return ['all'];
    }
    // Add other role-based permission logic here if needed
    return ['Dashboard']; 
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  // The session user object from next-auth might not have all our custom fields.
  // The 'user' property on the session is what we defined in the authorize callback.
  // We'll proceed with what we have, assuming role is on the token and session.
  const user = session?.user;
  const userPermissions = user?.role ? getPermissions(user.role) : [];


  return (
      <div className="flex h-screen bg-background">
        <Sidebar userPermissions={userPermissions} />
        <div className="flex-1 flex flex-col h-screen">
          <Header user={user} />
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
