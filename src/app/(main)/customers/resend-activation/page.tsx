"use client";

import { MakerMiniHistory } from "@/components/customers/MakerMiniHistory";
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
import { Search, Loader2, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CustomerDetails } from "@/components/customers/CustomerDetailsCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileUpload, type UploadedFile } from "@/components/ui/FileUpload";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function InfoItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div>{value}</div>
    </div>
  );
}

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "secondary";
    case "dormant":
      return "outline";
    case "block":
    case "inactive":
      return "destructive";
    default:
      return "default";
  }
};

export default function ResendActivationCodePage() {
  const [cifNumber, setCifNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [deliveryChannel, setDeliveryChannel] = useState("SMS");
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
    setDocuments([]);
    setDeliveryChannel("SMS");

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
    if (documents.length === 0) {
      toast({ variant: "destructive", title: "Documents required", description: "Please upload at least one supporting document." });
      return;
    }

    setIsActionLoading(true);
    try {
      const response = await fetch("/api/approvals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cif: customer.cifNumber,
          type: "resend-activation-code",
          customerName: customer.name,
          customerPhone: customer.phoneNumber,
          details: {
            reason: "Resend activation code due to previous SMS delivery failure",
            deliveryChannel,
            email: customer.email,
          },
          attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit resend activation request");
      }

      toast({
        title: "Request Submitted",
        description: `Activation code resend for ${customer.name} has been submitted for approval.`,
      });

      setCustomer(null);
      setCifNumber("");
      setDocuments([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const isActionDisabled = !customer || isActionLoading;

  return (
    <div className="w-full space-y-6 animate-fade-up max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Resend Activation Code</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter a CIF number to find a customer and submit an activation-code resend request for approval.
        </p>
      </div>
      <MakerMiniHistory approvalType="resend-activation-code" />

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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="rounded-xl"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="rounded-xl">
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
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem label="Name" value={customer.name} />
              <InfoItem label="CIF Number" value={customer.cifNumber} />
              <InfoItem label="Phone Number" value={customer.phoneNumber} />
              <InfoItem label="Email" value={customer.email} />
              <InfoItem 
                label="Mobile Status" 
                value={
                  <Badge 
                    variant={getStatusVariant(customer.mobileStatus)}
                    className={cn({
                      "bg-green-100 text-green-800 border-green-200": customer.mobileStatus === "Active",
                      "bg-red-100 text-red-800 border-red-200": customer.mobileStatus === "Suspended" || customer.mobileStatus === "InActive",
                      "bg-yellow-100 text-yellow-800 border-yellow-200": customer.mobileStatus === "Pending" || customer.mobileStatus === "Dormant",
                    })}
                  >
                    {customer.mobileStatus}
                  </Badge>
                } 
              />
            </div>

            <Separator />
            <h3 className="text-sm font-semibold">Delivery Channel</h3>
            <div className="max-w-md">
                <Select value={deliveryChannel} onValueChange={setDeliveryChannel}>
                    <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select delivery channel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="SMS">SMS Only</SelectItem>
                        {(customer.email && customer.email.trim() !== "") && (
                            <>
                                <SelectItem value="Email">Email Only</SelectItem>
                                <SelectItem value="Both">Both SMS & Email</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <Separator />
            <h3 className="text-sm font-semibold">Supporting Documents</h3>
            <FileUpload
              value={documents}
              onChange={setDocuments}
              label="Supporting Documents"
              required
              maxFiles={5}
              maxSizeMB={10}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleAction} disabled={isActionDisabled} className="rounded-xl gap-2">
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              Request Resend Activation Code
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
