
import { Suspense } from 'react';
import { UserPlus, Users, UserX, AlertCircle } from 'lucide-react';
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';

async function getCustomers() {
  const data = db.prepare("SELECT id, name, phone, status, registeredAt FROM customers ORDER BY registeredAt DESC").all();
  return data.map(customer => ({
    ...customer,
    registeredAt: format(new Date(customer.registeredAt), 'dd MMM yyyy, h:mm a'),
  }));
}

async function getCustomerStats() {
  const registered = db.prepare("SELECT COUNT(id) as count FROM customers").get()?.count ?? 0;
  const active = db.prepare("SELECT COUNT(id) as count FROM customers WHERE status = 'active'").get()?.count ?? 0;
  const inactive = db.prepare("SELECT COUNT(id) as count FROM customers WHERE status = 'inactive'").get()?.count ?? 0;
  const failed = db.prepare("SELECT COUNT(id) as count FROM customers WHERE status = 'failed'").get()?.count ?? 0;

  return { registered, active, inactive, failed };
}

export default async function ExistingCustomersPage() {
    const customers = await getCustomers();
    const stats = await getCustomerStats();
    
    return (
        <div className="space-y-8 w-full">
            <div>
                <h2 className="text-2xl font-headline font-semibold mb-4">Customer Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<StatsCardSkeleton />}>
                    <StatsCard
                    title="Registered Customers"
                    value={stats.registered.toLocaleString()}
                    icon={<UserPlus />}
                    color="bg-primary text-primary-foreground"
                    />
                </Suspense>
                <Suspense fallback={<StatsCardSkeleton />}>
                    <StatsCard
                    title="Active Customers"
                    value={stats.active.toLocaleString()}
                    icon={<Users />}
                    color="bg-green-600 text-white"
                    />
                </Suspense>
                <Suspense fallback={<StatsCardSkeleton />}>
                    <StatsCard
                    title="Inactive Customers"
                    value={stats.inactive.toLocaleString()}
                    icon={<UserX />}
                    color="bg-red-600 text-white"
                    />
                </Suspense>
                <Suspense fallback={<StatsCardSkeleton />}>
                    <StatsCard
                    title="Failed Registrations"
                    value={stats.failed.toLocaleString()}
                    icon={<AlertCircle />}
                    color="bg-gray-600 text-white"
                    />
                </Suspense>
                </div>
            </div>
            <CustomerTable 
                title="Existing Customers" 
                customers={customers} 
            />
        </div>
    )
}
