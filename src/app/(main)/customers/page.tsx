
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Link, UserCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { ExistingCustomerClient } from "@/components/customers/ExistingCustomerClient";
import config from "@/lib/config";

async function getAppUserStats() {
  try {
    const totalUsers = await prisma.appUser.count();
    const linkedAccounts = await prisma.account.count();
    const activeUsers = await prisma.appUser.count({ where: { Status: 'Active' } });

    return {
        totalUsers: totalUsers.toLocaleString(),
        linkedAccounts: linkedAccounts.toLocaleString(),
        activeUsers: activeUsers.toLocaleString(),
    };
  } catch (error) {
    console.error("Failed to fetch app user stats:", error);
    throw new Error(`Failed to fetch stats from the database: ${(error as Error).message}`);
  }
}


export default async function ExistingCustomersPage() {
  const userStats = await getAppUserStats();

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-headline font-semibold mb-4">App User Summary</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total App Users"
            value={userStats.totalUsers}
            icon={<Users />}
            color="bg-blue-500 text-white"
          />
          <StatsCard
            title="Total Linked Accounts"
            value={userStats.linkedAccounts}
            icon={<Link />}
             color="bg-indigo-500 text-white"
          />
          <StatsCard
            title="Active Users"
            value={userStats.activeUsers}
            icon={<UserCheck />}
            color="bg-green-600 text-white"
          />
        </div>
      </div>

      <ExistingCustomerClient />
    </div>
  );
}

    
