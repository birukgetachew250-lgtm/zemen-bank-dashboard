
import { Suspense } from 'react';
import { UserPlus, Users, UserX, UserCheck, AlertCircle } from 'lucide-react';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';
import { TransactionsSummary } from '@/components/dashboard/TransactionsSummary';
import { db } from '@/lib/db';
import config from "@/lib/config";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function getCustomerStats() {
    try {
      const total = await db.appUser.count();
      const active = await db.appUser.count({ where: { Status: 'Active' } });
      const inactive = await db.appUser.count({ where: { OR: [{ Status: 'Inactive' }, { Status: 'Dormant' }] } });
      const registered = await db.appUser.count({ where: { Status: 'Registered' } });
      return { total, active, inactive, registered };
    } catch (e: any) {
      // Re-throw the error to be caught by the boundary
      throw new Error(`Failed to fetch stats from the database: ${(e as Error).message}`);
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
    stats = { total: 'N/A', active: 'N/A', inactive: 'N/A', registered: 'N/A' };
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
              title="Total Customers"
              value={stats.total.toLocaleString()}
              icon={<Users />}
              color="bg-primary text-primary-foreground"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
            <StatsCard
              title="Active Customers"
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
              color="bg-red-600 text-white"
            />
          </Suspense>
          <Suspense fallback={<StatsCardSkeleton />}>
             <StatsCard
              title="Pending Registration"
              value={stats.registered.toLocaleString()}
              icon={<UserPlus />}
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
