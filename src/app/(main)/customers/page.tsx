

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Link, UserCheck } from "lucide-react";
import { db } from "@/lib/db";
import { ExistingCustomerClient } from "@/components/customers/ExistingCustomerClient";
import config from "@/lib/config";

async function getAppUserStats() {
  try {
    if (config.db.isProduction) {
      // In production, query the Oracle database with case-sensitive identifiers.
      const totalUsers = (await db.prepare('SELECT COUNT("Id") as count FROM "AppUsers"').get())?.count ?? 0;
      const linkedAccounts = (await db.prepare('SELECT COUNT("Id") as count FROM "Accounts"').get())?.count ?? 0;
      const activeUsers = (await db.prepare("SELECT COUNT(\"Id\") as count FROM \"AppUsers\" WHERE \"Status\" = 'Active'").get())?.count ?? 0;
      return {
        totalUsers: totalUsers.toLocaleString(),
        linkedAccounts: linkedAccounts.toLocaleString(),
        activeUsers: activeUsers.toLocaleString(),
      };
    } else {
      // In demo mode, query the SQLite database.
      const totalUsers = db.prepare("SELECT COUNT(Id) as count FROM AppUsers").get()?.count ?? 0;
      const linkedAccounts = db.prepare("SELECT COUNT(Id) as count FROM Accounts").get()?.count ?? 0;
      const activeUsers = db.prepare("SELECT COUNT(Id) as count FROM AppUsers WHERE Status = 'Active'").get()?.count ?? 0;
      return {
        totalUsers: totalUsers.toLocaleString(),
        linkedAccounts: linkedAccounts.toLocaleString(),
        activeUsers: activeUsers.toLocaleString(),
      };
    }
  } catch (error) {
    console.error("Failed to fetch app user stats:", error);
    // Throw an error to be caught by the Next.js error boundary
    // This will render the error.tsx file.
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
