"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DocumentViewer, type DocumentMeta } from "@/components/ui/DocumentViewer";
import { Loader2, ArrowLeft, ArrowRight, User, Fingerprint, Phone, Mail, Shield, Smartphone, Star, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';

interface ApprovalData {
  id: string;
  type: string;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
  status: string;
  submittedBy: string | null;
  attachmentUrl: string | null;
  checkerRemarks: string | null;
  details: any;
  documents: DocumentMeta[];
}

const labelMap: Record<string, string> = {
    email: "Email Address",
    phoneNumber: "Phone Number",
    signUpMainAuth: "Main Auth Method",
    signUp2FA: "Two-Factor Method",
    channel: "Channel",
};

const ChangeItem = ({ label: key, oldValue, newValue }: { label: string, oldValue: string, newValue: string}) => {
    if (oldValue === newValue) return null;
    const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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

const pageTitles: Record<string, string> = {
  'new-customer': 'Approve New Customer',
  'updated-customer': 'Approve Updated Profile',
  'customer-account': 'Approve Account Linking',
  'unlink-account': 'Approve Account Unlinking',
  'suspend-customer': 'Approve Customer Suspension',
  'unsuspend-customer': 'Approve Unsuspend Customer',
  'unlock-customer': 'Approve Unlock Customer',
  'resend-activation': 'Approve Resend Activation',
  'pin-reset': 'Approve PIN Reset',
};

export function ApprovalDetailClient({ approval }: { approval: ApprovalData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [checkerRemarks, setCheckerRemarks] = useState(approval.checkerRemarks || "");

  const handleAction = async (action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/approvals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: approval.id, action, checkerRemarks }),
      });
      const result = await response.json();
      if (response.ok) {
        toast({
          title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: result.message || `The request has been successfully ${action === 'approve' ? 'approved' : 'rejected'}.`,
        });
        
        router.back();
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
      setActionLoading(false);
    }
  };

  const parsedDetails = approval.details;
  const pageTitle = pageTitles[approval.type] || 'Review Approval Request';
  const approvalType = approval.type;

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-up">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
        <div className="relative z-10 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
            <p className="text-white/80 mt-1">
              Requested by {approval.submittedBy || 'Unknown Maker'} on {format(parseISO(approval.requestedAt), 'dd MMM yyyy, h:mm a')}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      </div>

      <Card className="glass-card shadow-sm border-slate-200/80 rounded-2xl animate-slide-in">
        <CardHeader className="border-b pb-4">
          <CardTitle>Review Details for {approval.customerName}</CardTitle>
          <CardDescription>Carefully review the request payload and supporting documentation before making a decision.</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          {/* ── Dynamic Details based on Type ── */}
          {parsedDetails && (
              <div className="grid gap-8">
                {approvalType === 'new-customer' && parsedDetails.customerData && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Customer Profile Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 p-5 border rounded-xl bg-muted/30">
                            <InfoItem icon={<User />} label="Full Name" value={parsedDetails.customerData.full_name} />
                            <InfoItem icon={<Fingerprint />} label="CIF Number" value={parsedDetails.customerData.customer_number} />
                            <InfoItem icon={<Phone />} label="Phone Number" value={parsedDetails.customerData.mobile_number} />
                            <InfoItem icon={<Mail />} label="Email Address" value={parsedDetails.customerData.email_id} />
                        </div>
                    </div>
                )}
                
                {approvalType === 'updated-customer' && parsedDetails.changes && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Requested Profile Changes</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border rounded-xl bg-muted/30">
                            {Object.entries(parsedDetails.changes).map(([key, value]: [string, any]) => (
                                <ChangeItem key={key} label={key} oldValue={value.old} newValue={value.new} />
                            ))}
                        </div>
                    </div>
                )}


                {approvalType === 'new-customer' && parsedDetails.linkedAccounts && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Accounts to be Linked ({parsedDetails.linkedAccounts.length})</h3>
                        <div className="border rounded-xl bg-white overflow-hidden">
                            <ul className="divide-y divide-border">
                                {parsedDetails.linkedAccounts.map((acc: any) => (
                                    <li key={acc.CUSTACNO} className="px-5 py-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <div>
                                            <p className="font-semibold text-foreground text-base">{acc.CUSTACNO}</p>
                                            <p className="text-muted-foreground mt-0.5">{acc.ACCLASSDESC}</p>
                                        </div>
                                        <Badge variant="outline" className="text-sm px-3 py-1 bg-muted/50">{acc.CCY}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                  {approvalType === 'new-customer' && parsedDetails.onboardingData && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Security & Channel Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-5 border rounded-xl bg-muted/30">
                            <InfoItem icon={<Shield />} label="Main Auth Method" value={parsedDetails.onboardingData.mainAuthMethod} />
                            <InfoItem icon={<Smartphone />} label="Channel Access" value={parsedDetails.onboardingData.channel} />
                            <InfoItem icon={<Star />} label="Two-Factor Method" value={parsedDetails.onboardingData.twoFactorAuthMethod} />
                            <InfoItem icon={<Mail />} label="Password Delivery" value={parsedDetails.onboardingData.deliveryChannel || 'SMS'} />
                        </div>
                    </div>
                )}
                  
                {approvalType === 'customer-account' && parsedDetails.linkedAccounts && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Accounts to be Linked ({parsedDetails.linkedAccounts.length})</h3>
                        <div className="border rounded-xl bg-white overflow-hidden">
                            <ul className="divide-y divide-border">
                                {parsedDetails.linkedAccounts.map((acc: any) => (
                                    <li key={acc.custacno} className="px-5 py-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors">
                                        <div>
                                            <p className="font-semibold text-foreground text-base">{acc.custacno}</p>
                                            <p className="text-muted-foreground mt-0.5">{acc.acclassdesc}</p>
                                        </div>
                                        <Badge variant="outline" className="text-sm px-3 py-1 bg-muted/50">{acc.ccy}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                {approvalType === 'unlink-account' && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Target Account to Unlink</h3>
                        <div className="p-5 border rounded-xl bg-muted/30">
                          <InfoItem icon={<Landmark />} label="Account Number" value={parsedDetails.accountNumber} />
                        </div>
                    </div>
                  )}

                {(approvalType === 'resend-activation-code' || approvalType === 'pin-reset') && parsedDetails.deliveryChannel && (
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-primary">Delivery Preferences</h3>
                        <div className="p-5 border rounded-xl bg-muted/30">
                          <InfoItem icon={<Mail />} label="Delivery Channel" value={parsedDetails.deliveryChannel} />
                        </div>
                    </div>
                )}

              </div>
          )}

          {/* ── Supporting Documents ── */}
          {approval.documents && approval.documents.length > 0 && (
            <div>
              <Separator className="my-8" />
              <h3 className="font-semibold text-lg mb-4 text-primary">Supporting Documents</h3>
              <DocumentViewer documents={approval.documents} />
            </div>
          )}
          
          {/* ── Maker Attachment ── */}
          {approval.attachmentUrl && (
            <div>
              <Separator className="my-8" />
              <h3 className="font-semibold text-lg mb-4 text-primary">Maker Attachments</h3>
              <div className="p-5 border rounded-xl bg-blue-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Shield className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="font-medium text-blue-900">Review Additional Maker File</p>
                     <p className="text-sm text-blue-700/70">The maker attached an additional document for review.</p>
                   </div>
                 </div>
                 <Button asChild variant="outline" className="bg-white hover:bg-blue-50">
                   <a href={approval.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      View Attached File
                    </a>
                 </Button>
              </div>
            </div>
          )}

          {/* ── Checker Remarks ── */}
          <div>
              <Separator className="my-8" />
              <h3 className="font-semibold text-lg mb-4 text-primary">Checker Remarks</h3>
              <Textarea
                  placeholder="Add any remarks or reasons for rejection here..."
                  value={checkerRemarks}
                  onChange={(e) => setCheckerRemarks(e.target.value)}
                  className="w-full min-h-[120px] rounded-xl bg-muted/10"
                  disabled={approval.status !== 'pending'}
              />
          </div>

        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 p-6 rounded-b-2xl">
          <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => router.back()}>Back</Button>
          
          {approval.status === 'pending' && (
            <>
              <Button
                  onClick={() => handleAction('reject')}
                  variant="destructive"
                  className="font-medium rounded-xl px-6 bg-red-600 hover:bg-red-700"
                  disabled={actionLoading}
                  >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject Request
              </Button>
              <Button
                  onClick={() => handleAction('approve')}
                  className="font-medium rounded-xl px-6 bg-primary hover:bg-primary/90"
                  disabled={actionLoading}
                  >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve Request
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
