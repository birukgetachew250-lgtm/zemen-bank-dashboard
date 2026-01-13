
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Loader2, Info, User, Phone, Mail, Fingerprint, Shield, Smartphone, Star, Landmark, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";


interface Approval {
  id: string;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
  details: string;
}

interface ApprovalClientPageProps {
  approvalType: string;
  pageTitle: string;
}

export function ApprovalClientPage({ approvalType, pageTitle }: ApprovalClientPageProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const { toast } = useToast();

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/pending?type=${approvalType}`);
      const data = await response.json();
      setApprovals(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching approvals",
        description: "Could not load data for approvals.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [approvalType]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedApproval) return;
    const { id } = selectedApproval;

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch('/api/approvals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: id, action }),
      });
      const result = await response.json();
      if (response.ok) {
        if (action === 'approve' && (result.newPin || result.tempPassword)) {
          toast({
            duration: 20000, 
            title: `Action Successful`,
            description: (
              <div className="flex flex-col gap-2 mt-2">
                <span>{result.message}</span>
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Temporary Password or PIN</AlertTitle>
                  <AlertDescription className="font-mono text-lg font-bold tracking-widest">{result.newPin || result.tempPassword}</AlertDescription>
                </Alert>
                <span className="text-xs text-muted-foreground">Please securely communicate this to the customer. It is valid for a short period.</span>
              </div>
            ),
          });
        } else {
           toast({
            title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
            description: result.message || `The request has been successfully ${action === 'approve' ? 'approved' : 'rejected'}.`,
          });
        }
        setSelectedApproval(null);
        fetchApprovals(); // Refresh the list
      } else {
        throw new Error(result.message || 'Action failed');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Failed to ${action} request`,
        description: error.message || "An error occurred while processing the request.",
      });
    } finally {
        setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const filteredApprovals = useMemo(() => {
    if (!searchTerm) return approvals;
    return approvals.filter(
      (approval) =>
        approval.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.customerPhone.includes(searchTerm)
    );
  }, [searchTerm, approvals]);
  
  const parsedDetails = useMemo(() => {
    if (!selectedApproval?.details) return null;
    try {
      return JSON.parse(selectedApproval.details);
    } catch {
      return null;
    }
  }, [selectedApproval]);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-headline font-semibold">{pageTitle}</h2>
            <Input 
              placeholder="Search by name or phone..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table className="font-body">
              <TableHeader className="bg-sidebar-bg/5 dark:bg-sidebar-bg/20">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredApprovals.length > 0 ? (
                  filteredApprovals.map((approval) => (
                    <TableRow key={approval.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedApproval(approval)}>
                      <TableCell className="font-medium">{approval.customerName}</TableCell>
                      <TableCell>{approval.customerPhone}</TableCell>
                      <TableCell>{format(parseISO(approval.requestedAt), 'dd MMM yyyy, h:mm a')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No pending approvals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedApproval} onOpenChange={(isOpen) => !isOpen && setSelectedApproval(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review {pageTitle}</DialogTitle>
            <DialogDescription>
                Review the details below for {selectedApproval?.customerName} and approve or reject the request.
            </DialogDescription>
          </DialogHeader>
            {parsedDetails && (
                 <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-6">
                    {approvalType === 'new-customer' && parsedDetails.customerData && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg bg-muted/50">
                                <InfoItem icon={<User />} label="Name" value={parsedDetails.customerData.full_name} />
                                <InfoItem icon={<Fingerprint />} label="CIF Number" value={parsedDetails.customerData.customer_number} />
                                <InfoItem icon={<Phone />} label="Phone" value={parsedDetails.customerData.mobile_number} />
                                <InfoItem icon={<Mail />} label="Email" value={parsedDetails.customerData.email_id} />
                            </div>
                        </div>
                    )}
                    
                    {approvalType === 'updated-customer' && parsedDetails.changes && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Requested Changes</h3>
                             <div className="grid grid-cols-1 gap-y-4 p-4 border rounded-lg bg-muted/50">
                                {Object.entries(parsedDetails.changes).map(([key, value]: [string, any]) => (
                                    <ChangeItem key={key} label={key.replace(/([A-Z])/g, ' $1')} oldValue={value.old} newValue={value.new} />
                                ))}
                            </div>
                        </div>
                    )}


                    {approvalType === 'new-customer' && parsedDetails.linkedAccounts && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Accounts to be Linked ({parsedDetails.linkedAccounts.length})</h3>
                            <div className="border rounded-lg">
                                <ul className="divide-y divide-border">
                                    {parsedDetails.linkedAccounts.map((acc: any) => (
                                        <li key={acc.CUSTACNO} className="px-4 py-3 flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-medium text-foreground">{acc.CUSTACNO}</p>
                                                <p className="text-muted-foreground">{acc.ACCLASSDESC}</p>
                                            </div>
                                            <Badge variant="outline">{acc.CCY}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    
                     {approvalType === 'new-customer' && parsedDetails.onboardingData && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Security & Channel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg bg-muted/50">
                                <InfoItem icon={<Shield />} label="Main Auth Method" value={parsedDetails.onboardingData.mainAuthMethod} />
                                <InfoItem icon={<Smartphone />} label="Channel" value={parsedDetails.onboardingData.channel} />
                                <InfoItem icon={<Star />} label="2FA Method" value={parsedDetails.onboardingData.twoFactorAuthMethod} />
                            </div>
                        </div>
                    )}
                     
                    {approvalType === 'customer-account' && parsedDetails.linkedAccounts && (
                       <div>
                            <h3 className="font-semibold text-lg mb-2">Accounts to be Linked ({parsedDetails.linkedAccounts.length})</h3>
                            <div className="border rounded-lg">
                                <ul className="divide-y divide-border">
                                    {parsedDetails.linkedAccounts.map((acc: any) => (
                                        <li key={acc.custacno} className="px-4 py-3 flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-medium text-foreground">{acc.custacno}</p>
                                                <p className="text-muted-foreground">{acc.acclassdesc}</p>
                                            </div>
                                            <Badge variant="outline">{acc.ccy}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {approvalType === 'unlink-account' && (
                       <InfoItem icon={<Landmark />} label="Account to Unlink" value={parsedDetails.accountNumber} />
                    )}

                 </div>
            )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button
                onClick={() => handleAction('reject')}
                variant="destructive"
                className="font-medium bg-red-600 hover:bg-red-700"
                disabled={actionLoading[selectedApproval?.id || '']}
                >
                {actionLoading[selectedApproval?.id || ''] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
            </Button>
            <Button
                onClick={() => handleAction('approve')}
                className="font-medium"
                disabled={actionLoading[selectedApproval?.id || '']}
                >
                {actionLoading[selectedApproval?.id || ''] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoItem({ icon, label, value, className }: { icon: React.ReactNode, label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <div className="w-6 h-6 text-muted-foreground mt-1">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-sm">{value}</p>
            </div>
        </div>
    )
}

function ChangeItem({ label, oldValue, newValue }: { label: string, oldValue: string, newValue: string}) {
    if (oldValue === newValue) return null;
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground line-through">{oldValue}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium text-foreground">{newValue}</span>
            </div>
        </div>
    )
}
