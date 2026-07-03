
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

type SearchMode = 'cif-phone' | 'account';

export function ExistingCustomerClient() {
  const [searchMode, setSearchMode] = useState<SearchMode>('cif-phone');
  const [searchTerm, setSearchTerm] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
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

  const handleAccountSearch = async () => {
    if (!accountNumber.trim()) {
      toast({ variant: "destructive", title: "Account number required", description: "Please enter an account number." });
      return;
    }
    setIsLoading(true);
    setCustomer(null);
    try {
      const response = await fetch(`/api/customers/search?accountNumber=${encodeURIComponent(accountNumber)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "No customer found for this account number");
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
      if (searchMode === 'cif-phone') handleCifSearch();
      else handleAccountSearch();
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>Search Existing Customer</CardTitle>
          <CardDescription>
            Find a customer by CIF number, phone number, or bank account number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search mode toggle */}
          <div className="flex gap-2 p-1 rounded-xl bg-muted/50 w-fit">
            <button
              type="button"
              onClick={() => { setSearchMode('cif-phone'); setCustomer(null); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                searchMode === 'cif-phone'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Hash className="h-3.5 w-3.5" />
              CIF / Phone
            </button>
            <button
              type="button"
              onClick={() => { setSearchMode('account'); setCustomer(null); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                searchMode === 'account'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Account Number
            </button>
          </div>

          {/* Search input */}
          {searchMode === 'cif-phone' ? (
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
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter bank account number..."
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                className="rounded-xl"
              />
              <Button onClick={handleAccountSearch} disabled={isLoading} className="rounded-xl gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          )}
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
