
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
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CreditCard, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerDetailsCard } from "@/components/customers/CustomerDetailsCard";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { cn } from "@/lib/utils";

export function ExistingCustomerClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const { toast } = useToast();

  const handleCifSearch = async () => {
    if (!searchTerm) {
      toast({ variant: "destructive", title: "Search term required", description: "Please enter a CIF or Phone Number to search." });
      return;
    }
    setIsLoading(true);
    setCustomer(null);
    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Customer not found");
      }
      const data = await response.json();
      setCustomer(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Search Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCifSearch();
    }
  };

  return (
    <>
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Search</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find and manage customer profiles by CIF or phone number.
        </p>
      </div>

      <Card className="max-w-2xl glass-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle>Search Existing Customer</CardTitle>
          <CardDescription>
            Find a customer by CIF number or phone number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter CIF or Phone Number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="rounded-xl"
            />
            <Button onClick={handleCifSearch} disabled={isLoading} className="rounded-xl gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center pt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {customer && (
        <div className="animate-in fade-in-50 mt-8">
          <CustomerDetailsCard customer={customer} />
        </div>
      )}
    </>
  );
}
