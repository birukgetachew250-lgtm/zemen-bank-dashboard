
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Search, Loader2, AlertTriangle, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface CustomerStatusClientProps {
    action: 'Suspend' | 'Unsuspend';
}

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

export function CustomerStatusClient({ action }: CustomerStatusClientProps) {
  const [cifNumber, setCifNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const targetStatus = action === 'Suspend' ? 'Block' : 'Active';
  const buttonLabel = action;
  const buttonIcon = action === 'Suspend' ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />;
  const buttonVariant = action === 'Suspend' ? 'destructive' : 'default';

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
        const response = await fetch('/api/customers/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cifNumber: customer.cifNumber, status: targetStatus }),
        });
        if (!response.ok) {
             const error = await response.json();
            throw new Error(error.message || `Failed to ${action.toLowerCase()} customer`);
        }
        
        // Redirect to success page
        router.push(`/customers/${action === 'Suspend' ? 'block' : 'unblock'}/success`);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: `${action} Failed`,
            description: error.message,
        });
    } finally {
        setIsActionLoading(false);
    }
  };

  const isActionDisabled = !customer || 
                         isActionLoading ||
                         customer.status === 'Pending' ||
                         (action === 'Suspend' && customer.status === 'Block') ||
                         (action === 'Unsuspend' && customer.status === 'Active');
                         
  const getAlertMessage = () => {
    if (!customer) return null;
    if (customer.status === 'Pending') {
        return `This customer's registration is still pending approval. Their status cannot be changed.`;
    }
    if (action === 'Suspend' && customer.status === 'Block') {
        return 'This customer is already suspended.';
    }
    if (action === 'Unsuspend' && customer.status === 'Active') {
        return 'This customer is already active.';
    }
    return null;
  }
  
  const alertMessage = getAlertMessage();

  return (
    <>
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{action} Customer</CardTitle>
                <CardDescription>
                    Enter a CIF number to find a customer and {action.toLowerCase()} their app access.
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
                    {alertMessage && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Action Unavailable</AlertTitle>
                            <AlertDescription>
                                {alertMessage}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleAction} disabled={isActionDisabled} variant={buttonVariant}>
                        {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : buttonIcon}
                        {buttonLabel}
                    </Button>
                </CardFooter>
            </Card>
        )}
    </>
  );
}
