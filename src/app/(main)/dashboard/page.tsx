
import { Suspense } from 'react';
import { Users, UserX, UserCheck, AlertCircle, Link } from 'lucide-react';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';
import { TransactionsSummary } from '@/components/dashboard/TransactionsSummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { executeQuery } from '@/lib/oracle-db';

async function getCustomerStats() {
  const connectionString = process.env.USER_MODULE_DB_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn("USER_MODULE_DB_CONNECTION_STRING not set. Dashboard stats will be 0.");
    return { total: 0, active: 0, inactive: 0, registered: 0, linkedAccounts: 0 };
  }

  try {
    const [
      totalResult,
      activeResult,
      inactiveDormantResult,
      linkedAccountsResult,
      registeredResult,
    ] = await Promise.all([
      executeQuery(connectionString, `SELECT COUNT(*) AS "count" FROM "USER_MODULE"."AppUsers"`),
      executeQuery(connectionString, `SELECT COUNT(*) AS "count" FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Active'`),
      executeQuery(connectionString, `SELECT COUNT(*) AS "count" FROM "USER_MODULE"."AppUsers" WHERE "Status" IN ('Inactive', 'Dormant')`),
      executeQuery(connectionString, `SELECT COUNT(*) AS "count" FROM "USER_MODULE"."Accounts" WHERE "Status" = 'Active'`),
      executeQuery(connectionString, `SELECT COUNT(*) AS "count" FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Registered'`),
    ]);

    const getCount = (result: any): number => {
      // Oracle can return count as a BigInt from the driver, which needs to be converted.
      const count = result?.rows?.[0]?.count;
      return Number(count) || 0;
    }

    const total = getCount(totalResult);
    const active = getCount(activeResult);
    const inactive = getCount(inactiveDormantResult);
    const linkedAccounts = getCount(linkedAccountsResult);
    const registered = getCount(registeredResult);

    return { total, active, inactive, registered, linkedAccounts };

  } catch (e: any) {
    console.error("Failed to fetch customer stats from Oracle DB:", e);
    throw new Error(`Failed to fetch stats from the user database. Please check the connection.`);
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
