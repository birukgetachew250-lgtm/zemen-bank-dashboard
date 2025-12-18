

'use client';
import { useState, useEffect } from "react";
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
import { Users, Link, UserCheck, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerDetailsCard } from "@/components/customers/CustomerDetailsCard";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { db } from "@/lib/db";

function getAppUserStats() {
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
    console.error("Failed to fetch app user stats:", error);
    // Return zeros if there's an error so the page doesn't crash
    return { totalUsers: "0", linkedAccounts: "0", activeUsers: "0" };
  }
}

export default function ExistingCustomersPage() {
  const [cifNumber, setCifNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const { toast } = useToast();
  
  // Stats will be fetched on the client side since this is a client component.
  // For better performance, this could be a server component passing data to a client child.
  const [userStats, setUserStats] = useState({
    totalUsers: "0",
    linkedAccounts: "0",
    activeUsers: "0",
  });

  useEffect(() => {
    // This is a workaround to fetch server-side data in a client component.
    // In a real app, you might use an API route or restructure the components.
    const stats = getAppUserStats();
    setUserStats(stats);
  }, []);

  const handleSearch = async () => {
    if (!cifNumber) {
        toast({
            variant: "destructive",
            title: "CIF number required",
            description: "Please enter a CIF number to search.",
        });
        return;
    }
    setIsLoading(true);
    setCustomer(null);
    try {
        const response = await fetch(`/api/customers/${cifNumber}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Customer not found");
        }
        const data = await response.json();
        setCustomer(data);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Search Failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
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

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Search Customer</CardTitle>
          <CardDescription>
            Enter a CIF number to find a specific app user and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter CIF Number (e.g., 0048533)"
              value={cifNumber}
              onChange={(e) => setCifNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {customer && (
        <div className="animate-in fade-in-50">
            <CustomerDetailsCard customer={customer} />
        </div>
      )}
    </div>
  );
}
