
'use client';
import { useState } from "react";
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

// Mock data for the summary stats
const userStats = {
  totalUsers: "15,432",
  linkedAccounts: "25,123",
  activeUsers: "12,890",
};

export default function ExistingCustomersPage() {
  const [cifNumber, setCifNumber] = useState("cust_1");
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const { toast } = useToast();

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
    <div className="space-y-8">
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
            Enter a Customer ID to find a specific app user and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter Customer ID (e.g., cust_1)"
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
