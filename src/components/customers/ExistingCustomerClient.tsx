
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
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerDetailsCard } from "@/components/customers/CustomerDetailsCard";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";

export function ExistingCustomerClient() {
  const [cifNumber, setCifNumber] = useState("");
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
    <>
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
    </>
  );
}
