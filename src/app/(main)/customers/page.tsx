
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Link, UserCheck, Search } from "lucide-react";

// Mock data for the summary stats
const userStats = {
  totalUsers: "15,432",
  linkedAccounts: "25,123",
  activeUsers: "12,890",
};

export default function ExistingCustomersPage() {
  const [cifNumber, setCifNumber] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (cifNumber) {
      // We will construct a mock customer ID from the CIF for demonstration.
      // In a real app, you might have a lookup service first.
      router.push(`/customers/cust_${cifNumber}`);
    }
  };

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

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Search Customer</CardTitle>
          <CardDescription>
            Enter a Customer Information File (CIF) number to find a specific app user and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter CIF Number..."
              value={cifNumber}
              onChange={(e) => setCifNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
