
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { redirect } from 'next/navigation';

// In a real app, this would involve validating a session token (e.g., from an HTTP-only cookie)
const getSession = async () => {
    // For this demonstration, we'll simulate a logged-in user.
    // In a real implementation, return null if the session is invalid.
    return {
        isLoggedIn: true,
        user: { name: 'Admin User', email: 'admin@zemen.com' }
    };
};


export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.isLoggedIn) {
    redirect('/login');
  }

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
