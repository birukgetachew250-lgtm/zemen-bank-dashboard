
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { verifySessionAndPermissions } from "@/lib/auth";
import { headers } from 'next/headers';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get('x-next-pathname') || '/';
  await verifySessionAndPermissions(pathname);
  
  return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen">
          <Header />
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
