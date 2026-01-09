
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const getSession = async () => {
    const cookieStore = cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
        return { isLoggedIn: false, user: null, permissions: [] };
    }
    
    // In a real app, you would validate the session more thoroughly
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
        return { isLoggedIn: false, user: null, permissions: [] };
    }
    
    // Fetch permissions for the user's role
    const role = db.prepare('SELECT permissions FROM roles WHERE name = ?').get(user.role);
    const permissions = role ? JSON.parse(role.permissions) : [];
    
    const { password, ...userWithoutPassword } = user;

    return {
        isLoggedIn: true,
        user: userWithoutPassword,
        permissions: permissions
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
        <Sidebar userPermissions={session.permissions} />
        <div className="flex-1 flex flex-col h-screen">
          <Header user={session.user} />
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

    