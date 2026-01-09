
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import config from "@/lib/config";

const getSessionData = async () => {
    // DEMO MODE: If not in production, bypass session check and return a mock admin user
    if (!config.db.isProduction) {
        const user = await db.user.findFirst({
            where: { role: 'Super Admin' },
        });

        if (user) {
            const { password, ...userWithoutPassword } = user;
            return {
                isLoggedIn: true,
                user: userWithoutPassword,
                permissions: ['all']
            };
        }
        // Fallback mock user if DB is empty
        return {
            isLoggedIn: true,
            user: { id: 1, name: 'Demo Admin', email: 'admin@zemen.com', role: 'Super Admin' },
            permissions: ['all']
        };
    }

    // PRODUCTION MODE: Standard session validation
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { isLoggedIn: false, user: null, permissions: [] };
    }
    
    const user = await db.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
        return { isLoggedIn: false, user: null, permissions: [] };
    }
    
    let permissions = [];
    switch (user.role) {
        case 'Super Admin':
            permissions = ['all'];
            break;
        case 'Operations Lead':
            permissions = ['Dashboard', 'Banking Users', 'Transactions', 'Mini Apps', 'Oversight'];
            break;
        case 'Compliance Officer':
            permissions = ['Oversight', 'Reporting'];
            break;
        case 'Support Staff':
             permissions = ['Dashboard', 'Banking Users'];
             break;
        default:
            permissions = ['Dashboard'];
            break;
    }
    
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
  const session = await getSessionData();

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
