
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Watermark } from "@/components/layout/Watermark";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

const getSessionData = async () => {
    let session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      // Not logged in, but we might be in demo mode.
      // Let's check for the mock user case directly.
       try {
            // This is a check to see if we can connect to the DB at all.
            await db.$connect();
            const user = await db.user.findFirst({
                where: { email: 'admin@zemen.com' },
            });

            if (user) {
                const { password, ...userWithoutPassword } = user;
                return {
                    isLoggedIn: true,
                    user: userWithoutPassword,
                    permissions: ['all']
                };
            }
        } catch (e) {
            console.error("Layout DB check failed, using fallback mock user.", e);
        }

        // If all else fails, and we have no session, try the ultimate fallback
        return {
            isLoggedIn: true, // Assume logged in for demo
            user: { id: "1", name: 'Demo Admin', email: 'admin@zemen.com', role: 'Super Admin' },
            permissions: ['all']
        };
    }
    
    // Logged in user exists, fetch their details
    try {
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

    } catch (e) {
         console.error("Layout DB check for session user failed, using session user as fallback.", e);
         // If db fails, but we have a session, we can still proceed with session data
         return {
            isLoggedIn: true,
            user: session.user,
            permissions: ['all'], // Assume super admin in this failure case for demo
         }
    }
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
