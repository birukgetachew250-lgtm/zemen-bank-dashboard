
import { Suspense } from 'react';
import { Users, UserX, UserCheck, AlertCircle, Link, Clock, CheckCircle } from 'lucide-react';
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
      const count = result?.rows?.[0]?.count;
      return Number(count) || 0;
    }

    return {
      total: getCount(totalResult),
      active: getCount(activeResult),
      inactive: getCount(inactiveDormantResult),
      linkedAccounts: getCount(linkedAccountsResult),
      registered: getCount(registeredResult),
    };

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
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Fetching Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Customer Overview ── */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Customer Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Mobile banking enrollment & account statistics</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Total App Users"
              value={stats.total}
              icon={<Users />}
              gradientStyle="hsl(347, 72%, 44%)"
              subtitle="All registered users"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Linked Accounts"
              value={stats.linkedAccounts}
              icon={<Link />}
              gradientStyle="hsl(233, 55%, 52%)"
              subtitle="Active linked bank accounts"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Active Users"
              value={stats.active}
              icon={<UserCheck />}
              gradientStyle="hsl(142, 71%, 45%)"
              subtitle="Currently active"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Inactive / Dormant"
              value={stats.inactive}
              icon={<UserX />}
              gradientStyle="hsl(38, 92%, 50%)"
              subtitle="Inactive or dormant accounts"
            />
          </Suspense>
        </div>
      </div>

      {/* ── Pending Requests Summary ── */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Pending Activity</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Requests awaiting action — see Overview for full details</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-300 opacity-15 blur-2xl" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Maker Queue</p>
                <p className="text-3xl font-extrabold text-amber-900 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>—</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-700">Your pending requests awaiting checker approval</p>
            <a
              href="/overview/maker"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 mt-3 hover:text-amber-900 transition-colors"
            >
              View Maker Dashboard →
            </a>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-300 opacity-15 blur-2xl" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Checker Queue</p>
                <p className="text-3xl font-extrabold text-blue-900 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>—</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-700">Requests pending your approval as checker</p>
            <a
              href="/overview/checker"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 mt-3 hover:text-blue-900 transition-colors"
            >
              View Checker Dashboard →
            </a>
          </div>
        </div>
      </div>
      
      {/* ── Transactions Summary ── */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Transactions Summary</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Recent transaction activity across all channels</p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading transactions...</p>}>
          <TransactionsSummary />
        </Suspense>
      </div>
    </div>
  );
}
