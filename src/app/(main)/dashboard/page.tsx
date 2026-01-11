
import { Suspense } from 'react';
import { UserPlus, Users, UserX, UserCheck, AlertCircle, Link } from 'lucide-react';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';
import { TransactionsSummary } from '@/components/dashboard/TransactionsSummary';
import { db } from '@/lib/db';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { executeQuery } from '@/lib/oracle-db';

async function getCustomerStats() {
  try {
    const totalResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers"`);
    const activeResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Active'`);
    const linkedAccountsResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."Accounts"`);
    
    const total = totalResult[0]?.COUNT || 0;
    const active = activeResult[0]?.COUNT || 0;
    const linkedAccounts = linkedAccountsResult[0]?.COUNT || 0;

    const inactiveAndDormant = await db.customer.count({ where: { status: { in: ['Inactive', 'Dormant'] } } });

    return { total, active, inactive: inactiveAndDormant, registered: total - active - inactiveAndDormant, linkedAccounts };

  } catch (e: any) {
    console.error("Failed to fetch customer stats:", e);
    
    if (e.message.includes('NJS-530')) {
        throw new Error(`Failed to connect to the Oracle database. Please ensure the USER_MODULE_DB_CONNECTION_STRING in your .env file is correct and the database is accessible.`);
    }
    
    // Return mock data for other errors
    throw new Error(`Failed to fetch stats from the database: ${e.message}`);
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
