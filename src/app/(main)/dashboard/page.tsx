
import { Suspense } from 'react';
import { UserPlus, Users, UserX, UserCheck, AlertCircle, Link } from 'lucide-react';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';
import { TransactionsSummary } from '@/components/dashboard/TransactionsSummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from "@/lib/db";

async function getCustomerStats() {
  try {
    const total = await db.customer.count();
    const active = await db.customer.count({ where: { status: 'Active' } });
    const inactiveAndDormant = await db.customer.count({
      where: { OR: [{ status: 'Inactive' }, { status: 'Dormant' }] },
    });
    const registered = await db.customer.count({ where: { status: 'Registered' }});
    
    // Since there's no separate `Accounts` table in the dashboard schema that represents "linking",
    // we'll make a reasonable assumption that an active customer has at least one linked account.
    // This can be adjusted if business logic differs.
    const linkedAccounts = active;

    return { total, active, inactive: inactiveAndDormant, registered, linkedAccounts };

  } catch (e: any) {
    console.error("Failed to fetch customer stats:", e);
    // Remove Oracle-specific error message
    throw new Error(`Failed to fetch stats from the database. Please check the connection and ensure migrations are up to date.`);
  }
}

export default async function DashboardPage() {
  let stats;
  let error: string | null = null;

  try {
    stats = await getCustomerStats();
  } catch (e: any) {
    console.error("Dashboard database error:", e.message);
    error = e.message;
    stats = { total: 0, active: 0, inactive: 0, registered: 0, linkedAccounts: 0 };
  }
  
  return (
    <div className="space-y-8">
      {error && (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Fetching Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <h2 className="text-2xl font-headline font-semibold mb-4">Customer Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Total App Users"
              value={stats.total.toLocaleString()}
              icon={<Users />}
              color="bg-primary text-primary-foreground"
            />
          </Suspense>
           <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Total Linked Accounts"
              value={stats.linkedAccounts.toLocaleString()}
              icon={<Link />}
             color="bg-indigo-500 text-white"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Active Users"
              value={stats.active.toLocaleString()}
              icon={<UserCheck />}
              color="bg-green-600 text-white"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
             <StatsCard
              title="Inactive / Dormant"
              value={stats.inactive.toLocaleString()}
              icon={<UserX />}
              color="bg-yellow-500 text-white"
            />
          </Suspense>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-headline font-semibold mb-4">Transactions Summary</h2>
        <Suspense fallback={<p>Loading transactions...</p>}>
          <TransactionsSummary />
        </Suspense>
      </div>

    </div>
  );
}
