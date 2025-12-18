

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

function getAppUserStats() {
  // If in production, do not attempt to query the demo DB.
  // The real implementation would use an Oracle client here.
  if (config.db.isProduction) {
    console.log("Production mode: Skipping demo DB query for user stats. Real Oracle implementation needed.");
    return { totalUsers: "0", linkedAccounts: "0", activeUsers: "0" };
  }
  
  try {
    const totalUsers = db.prepare("SELECT COUNT(Id) as count FROM AppUsers").get()?.count ?? 0;
    const linkedAccounts = db.prepare("SELECT COUNT(Id) as count FROM Accounts").get()?.count ?? 0;
    const activeUsers = db.prepare("SELECT COUNT(Id) as count FROM AppUsers WHERE Status = 'Active'").get()?.count ?? 0;
    return {
      totalUsers: totalUsers.toLocaleString(),
      linkedAccounts: linkedAccounts.toLocaleString(),
      activeUsers: activeUsers.toLocaleString(),
    };
  } catch (error) {
    console.error("Failed to fetch app user stats from demo DB:", error);
    // Return zeros if there's an error so the page doesn't crash
    return { totalUsers: "0", linkedAccounts: "0", activeUsers: "0" };
  }
}

export default function ExistingCustomersPage() {
  const userStats = getAppUserStats();

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
