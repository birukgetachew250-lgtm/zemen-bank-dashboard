'use client';
import { MakerMiniHistory } from "@/components/customers/MakerMiniHistory";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Search, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileUpload, type UploadedFile } from "@/components/ui/FileUpload";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("space-y-1", className)}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div>{value}</div>
        </div>
    );
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
};

function RequestSecurityResetContent() {
  const searchParams = useSearchParams();
  const initialCif = searchParams.get('cif') || '';

  const [cifNumber, setCifNumber] = useState(initialCif);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [deliveryChannel, setDeliveryChannel] = useState("SMS");
  const { toast } = useToast();

  const fetchCustomerByCif = async (cif: string) => {
    if (!cif) return;
    setIsLoading(true);
    setCustomer(null);
    setDocuments([]);
    setDeliveryChannel("SMS");
    try {
        const response = await fetch(`/api/customers/${cif}`);
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

  useEffect(() => {
    if (initialCif) {
      fetchCustomerByCif(initialCif);
    }
  }, [initialCif]);

  const handleSearch = async () => {
    if (!cifNumber) {
        toast({ variant: "destructive", title: "CIF number required", description: "Please enter a CIF number to search." });
        return;
    }
    fetchCustomerByCif(cifNumber);
  };
  
  const handleAction = async () => {
    if (!customer) return;
    if (documents.length === 0) {
      toast({ variant: "destructive", title: "Documents required", description: "Please upload at least one supporting document." });
      return;
    }

    setIsActionLoading(true);
    try {
        const response = await fetch('/api/approvals/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              cif: customer.cifNumber, 
              type: 'reset-security-questions', 
              customerName: customer.name, 
              customerPhone: customer.phoneNumber,
              details: {
                deliveryChannel,
                email: customer.email,
                reason: 'Customer requested security question reset'
              },
              attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
            }),
        });
        if (!response.ok) {
             const error = await response.json();
            throw new Error(error.message || `Failed to request Security Question reset`);
        }
        toast({ 
          title: "Request Submitted", 
          description: `Security Question reset request for ${customer.name} has been submitted for approval.` 
        });
        setCustomer(null);
        setCifNumber("");
        setDocuments([]);
    } catch (error: any) {
        toast({ variant: "destructive", title: `Request Failed`, description: error.message });
    } finally {
        setIsActionLoading(false);
    }
  };

  const isActionDisabled = !customer || isActionLoading;

  return (
    <div className="w-full space-y-6 animate-fade-up max-w-2xl">
        <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Request Security Question Reset</h1>
            <p className="text-muted-foreground text-sm mt-1">
                Enter a CIF number to find a customer and submit a Security Question reset request for approval.
            </p>
        </div>
        <MakerMiniHistory approvalType="reset-security-questions" />

        <Card className="glass-card shadow-sm border-slate-200/80 rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base">Find Customer</CardTitle>
                <CardDescription>Search by CIF number</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Enter CIF Number..."
                        value={cifNumber}
                        onChange={(e) => setCifNumber(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="rounded-xl"
                    />
                    <Button onClick={handleSearch} disabled={isLoading} className="rounded-xl shrink-0">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">Search</span>
                    </Button>
                </div>
            </CardContent>
        </Card>

        {customer && (
            <Card className="glass-card shadow-sm border-slate-200/80 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Name" value={customer.name} />
                        <InfoItem label="CIF Number" value={customer.cifNumber} />
                        <InfoItem label="Phone Number" value={customer.phoneNumber} />
                        <InfoItem label="Email" value={customer.email || 'N/A'} />
                        <InfoItem label="Mobile Status" value={
                            <Badge variant={getStatusVariant(customer.mobileStatus)}
                                className={cn({
                                    'bg-green-100 text-green-800 border-green-200': customer.mobileStatus === 'Active',
                                    'bg-red-100 text-red-800 border-red-200': customer.mobileStatus === 'Suspended' || customer.mobileStatus === 'InActive',
                                    'bg-yellow-100 text-yellow-800 border-yellow-200': customer.mobileStatus === 'Pending' || customer.mobileStatus === 'Dormant',
                                })}
                            >
                                {customer.mobileStatus}
                            </Badge>
                        } />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Delivery Channel</label>
                        <Select value={deliveryChannel} onValueChange={setDeliveryChannel}>
                            <SelectTrigger className="w-full rounded-xl">
                                <SelectValue placeholder="Select delivery channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SMS">SMS Only</SelectItem>
                                {customer.email && customer.email.trim() !== "" && (
                                    <SelectItem value="Email">Email Only</SelectItem>
                                )}
                                <SelectItem value="Both">Both SMS and Email</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            A security question will be randomly assigned from the system bank and a 10-character alphanumeric answer generated and delivered upon approval.
                        </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                         <label className="text-sm font-medium">Supporting Documents <span className="text-destructive">*</span></label>
                         <FileUpload 
                           value={documents}
                           onChange={setDocuments}
                           label="Supporting Documents"
                           required
                           maxFiles={3}
                           maxSizeMB={10}
                         />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleAction} 
                        disabled={isActionDisabled} 
                        className="w-full rounded-xl bg-primary hover:bg-primary/90"
                    >
                        {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Submit for Approval
                    </Button>
                </CardFooter>
            </Card>
        )}
    </div>
  );
}

export default function RequestSecurityResetPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <RequestSecurityResetContent />
    </Suspense>
  );
}
