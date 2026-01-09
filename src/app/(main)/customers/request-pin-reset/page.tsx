
'use client';
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("space-y-1", className)}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div>{value}</div>
        </div>
    )
}

const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active': return 'secondary';
        case 'dormant': return 'outline';
        case 'block':
        case 'inactive':
             return 'destructive';
        default: return 'default';
    }
}

export default function RequestPinResetPage() {
  const [cifNumber, setCifNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const { toast } = useToast();
  const router = useRouter();


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
  
  const handleAction = async () => {
    if (!customer) return;

    setIsActionLoading(true);
     try {
        const response = await fetch('/api/approvals/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cif: customer.cifNumber, type: 'pin-reset', customerName: customer.name, customerPhone: customer.phoneNumber }),
        });
        if (!response.ok) {
             const error = await response.json();
            throw new Error(error.message || `Failed to request PIN reset`);
        }
        toast({
          title: "Request Submitted",
          description: `PIN reset for ${customer.name} has been submitted for approval.`
        });
        setCustomer(null);
        setCifNumber("");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: `Request Failed`,
            description: error.message,
        });
    } finally {
        setIsActionLoading(false);
    }
  };

  const isActionDisabled = !customer || isActionLoading;

  return (
    <div className="w-full space-y-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Request PIN Reset</CardTitle>
                <CardDescription>
                    Enter a CIF number to find a customer and submit a PIN reset request for approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center space-x-2">
                    <Input
                    type="text"
                    placeholder="Enter CIF Number"
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
            <Card className="max-w-2xl mx-auto animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <InfoItem label="Name" value={customer.name} />
                        <InfoItem label="CIF Number" value={customer.cifNumber} />
                        <InfoItem label="Phone Number" value={customer.phoneNumber} />
                        <InfoItem label="Email" value={customer.email} />
                        <InfoItem label="Status" value={
                            <Badge variant={getStatusVariant(customer.status)}
                                className={cn({
                                    'bg-green-100 text-green-800 border-green-200': customer.status === 'Active',
                                    'bg-red-100 text-red-800 border-red-200': customer.status === 'Block' || customer.status === 'Inactive',
                                    'bg-yellow-100 text-yellow-800 border-yellow-200': customer.status === 'Pending' || customer.status === 'Dormant',
                                })}
                            >
                                {customer.status}
                            </Badge>
                        } />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleAction} disabled={isActionDisabled}>
                        {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        Request PIN Reset
                    </Button>
                </CardFooter>
            </Card>
        )}
    </div>
  );
}
