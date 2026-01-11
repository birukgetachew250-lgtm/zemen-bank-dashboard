

import { Suspense } from 'react';
import { UserPlus, Users, UserX, UserCheck, AlertCircle, Link } from 'lucide-react';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';
import { TransactionsSummary } from '@/components/dashboard/TransactionsSummary';
import { db } from '@/lib/db';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { executeQuery } from '@/lib/oracle-db';

async function getCustomerStats() {
  try {
    const totalResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "AppUsers"`);
    const activeResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "AppUsers" WHERE "Status" = 'Active'`);
    const linkedAccountsResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "Accounts"`);
    
    const total = totalResult[0]?.COUNT || 0;
    const active = activeResult[0]?.COUNT || 0;
    const linkedAccounts = linkedAccountsResult[0]?.COUNT || 0;

    const inactiveAndDormant = await db.customer.count({ where: { status: { in: ['Inactive', 'Dormant'] } } });

    return { total, active, inactive: inactiveAndDormant, registered: total - active - inactiveAndDormant, linkedAccounts };

  } catch (e: any) {
    console.error("Failed to fetch customer stats:", e);
    // Return mock data on error
    return { total: 6, active: 3, inactive: 2, registered: 1, linkedAccounts: 8 };
  }
}

export default async function DashboardPage() {
  let stats;
  let error: string | null = null;

  try {
    stats = await getCustomerStats();
  } catch (e: any) {
    console.error("Dashboard database error:", e.message);
    error = `Failed to connect to the database. Please check the connection settings and network. Details: ${e.message}`;
    stats = { total: 6, active: 3, inactive: 2, registered: 1, linkedAccounts: 8 };
  }
  
  return (
    <div className="space-y-8">
      {error && (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
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
