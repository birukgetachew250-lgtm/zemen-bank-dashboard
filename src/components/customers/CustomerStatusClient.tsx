'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MakerMiniHistory } from '@/components/customers/MakerMiniHistory';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { useToast } from '@/hooks/use-toast';
import type { CustomerDetails } from '@/components/customers/CustomerDetailsCard';
import { cn } from '@/lib/utils';
import {
  Search,
  Loader2,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  Hash,
  Smartphone,
  Radio,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface CustomerStatusClientProps {
  action: 'Suspend' | 'Unsuspend' | 'Unblock';
}

interface CandidateMatch {
  id: string;
  cifNumber: string;
  name: string;
  phoneNumber: string;
  branchName?: string;
  mobileStatus?: string;
}

const SUSPEND_REASON_PRESETS = [
  'Customer reported lost or stolen mobile device',
  'Suspected unauthorized access / compromised credentials',
  'Branch compliance / KYC verification hold requested',
  'Customer written request for temporary channel freeze',
];

const UNSUSPEND_REASON_PRESETS = [
  'Customer identity verified in-branch with valid ID',
  'Replacement mobile device verified and cleared by security',
  'Compliance / KYC hold resolved and cleared for restoration',
  'Customer signed formal reactivation request at branch',
];

export function CustomerStatusClient({ action }: CustomerStatusClientProps) {
  const isSuspend = action === 'Suspend';
  const approvalType = isSuspend ? 'suspend-customer' : 'unsuspend-customer';

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [reason, setReason] = useState('');
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const { toast } = useToast();
  const router = useRouter();

  const loadCustomerProfile = async (cif: string) => {
    setIsLoading(true);
    setCandidates([]);
    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(cif)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Customer not found');
      }
      const data = await response.json();
      setCustomer(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Customer Lookup Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Search term required',
        description: 'Enter a CIF number, phone number, or customer name.',
      });
      return;
    }

    setIsLoading(true);
    setCustomer(null);
    setCandidates([]);
    setDocuments([]);

    try {
      // Direct lookup if numeric CIF/Phone
      if (/^\+?\d{5,15}$/.test(trimmed)) {
        const directRes = await fetch(`/api/customers/${encodeURIComponent(trimmed)}`);
        if (directRes.ok) {
          const data = await directRes.json();
          setCustomer(data);
          return;
        }
      }

      // Smart search across CIF, Phone, and Name
      const searchRes = await fetch(
        `/api/customers/search?q=${encodeURIComponent(trimmed)}`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const matches: CandidateMatch[] = searchData.results || [];
        if (matches.length === 1) {
          await loadCustomerProfile(matches[0].cifNumber);
          return;
        } else if (matches.length > 1) {
          setCandidates(matches);
          return;
        }
      }

      await loadCustomerProfile(trimmed);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!customer) return;
    if (documents.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Supporting Document Required',
        description: 'Please attach at least one authorization or mandate document.',
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const response = await fetch('/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cif: customer.cifNumber,
          type: approvalType,
          customerName: customer.name,
          customerPhone: customer.phoneNumber,
          details: {
            reason:
              reason.trim() ||
              (isSuspend
                ? 'Customer channel access suspension requested'
                : 'Customer channel access restoration requested'),
            documents: documents.map((d) => ({
              name: d.name,
              url: d.url,
              type: d.type,
              size: d.size,
            })),
          },
          attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to request ${action.toLowerCase()}`);
      }

      toast({
        title: `${action} Request Submitted`,
        description: `Request for ${customer.name} (CIF: ${customer.cifNumber}) has been sent to the Checker queue.`,
      });
      setSearchQuery('');
      setCustomer(null);
      setReason('');
      setDocuments([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `${action} Request Failed`,
        description: error.message,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const isAlreadySuspended =
    customer?.isSuspended ||
    customer?.mobileStatus === 'Suspended' ||
    customer?.mobileStatus === 'InActive';

  const isActionDisabled =
    !customer ||
    isActionLoading ||
    customer.mobileStatus === 'Pending' ||
    (isSuspend && isAlreadySuspended) ||
    (!isSuspend && customer.mobileStatus === 'Active' && !customer.isSuspended);

  const getAlertMessage = () => {
    if (!customer) return null;
    if (customer.mobileStatus === 'Pending') {
      return "This customer's registration is still pending initial approval. Their channel status cannot be modified yet.";
    }
    if (isSuspend && isAlreadySuspended) {
      return 'This customer is already Suspended / Inactive. Use Unsuspend Customer to restore their access.';
    }
    if (!isSuspend && customer.mobileStatus === 'Active' && !customer.isSuspended) {
      return 'This customer is already Active on SuperApp channels.';
    }
    return null;
  };

  const alertMessage = getAlertMessage();
  const presets = isSuspend ? SUSPEND_REASON_PRESETS : UNSUSPEND_REASON_PRESETS;

  return (
    <div className="space-y-6">
      {/* ─── Distinct Executive Banner (Crimson Freeze vs Emerald Restoration) ─── */}
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border p-6 md:p-7 text-white shadow-xl',
          isSuspend ? 'border-rose-500/30' : 'border-emerald-500/30'
        )}
        style={{
          background: isSuspend
            ? 'radial-gradient(80% 130% at 100% 0%, hsl(347 85% 40% / 0.78), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(25 90% 35% / 0.5), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(347 45% 8%))'
            : 'radial-gradient(80% 130% at 100% 0%, hsl(158 80% 34% / 0.78), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(192 85% 32% / 0.55), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(165 48% 7%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-md',
                isSuspend
                  ? 'bg-rose-500/20 text-rose-200 ring-rose-400/35'
                  : 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/35'
              )}
            >
              {isSuspend ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-300" />
                  Emergency Channel Freeze & Access Hold
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  Channel Access Restoration & Clearance
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isSuspend
                ? 'Suspend Customer SuperApp & USSD Access'
                : 'Unsuspend & Restore Customer Access'}
            </h1>
            <p className="text-xs md:text-sm text-white/75 leading-relaxed">
              {isSuspend
                ? 'Immediately queue a temporary access freeze on Mobile Banking and USSD channels for compromised devices, lost phones, or compliance holds.'
                : 'Verify customer identity clearance and restore suspended Mobile Banking and USSD channels back to Active status via Checker approval.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  isSuspend
                    ? '/customers/unsuspend-customer'
                    : '/customers/suspend-customer'
                )
              }
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              {isSuspend ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-300" />
                  Switch to Unsuspend
                </>
              ) : (
                <>
                  <Ban className="h-3.5 w-3.5 text-rose-300" />
                  Switch to Suspend
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  isSuspend
                    ? '/customers/approve-suspension'
                    : '/customers/approve-unblocked'
                )
              }
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
              Checker Queue
            </Button>
          </div>
        </div>

        {/* Embedded Smart Search Bar */}
        <div className="relative z-10 mt-6 rounded-2xl border border-white/15 bg-slate-950/60 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                type="text"
                placeholder="Search customer by CIF Number (e.g. 0048533), Phone (+251...), or Full Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-11 rounded-xl border-white/20 bg-slate-900/85 pl-10 text-white caret-white placeholder:text-white/50 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:border-white/40"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className={cn(
                'h-11 rounded-xl px-6 font-semibold text-white shadow-lg gap-2',
                isSuspend
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Locate Customer
            </Button>
          </div>

          {/* Multi-match Candidate Selector */}
          {candidates.length > 1 && (
            <div className="mt-3 rounded-xl border border-white/15 bg-slate-900/90 p-3">
              <p className="mb-2 text-xs font-semibold text-white/80">
                Multiple customers matched ({candidates.length}). Select one:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((c) => (
                  <button
                    key={c.cifNumber}
                    type="button"
                    onClick={() => loadCustomerProfile(c.cifNumber)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-white/30 hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{c.name}</p>
                      <p className="font-mono text-[11px] text-white/65">
                        CIF: {c.cifNumber} • {c.phoneNumber}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 2-Column Workspace: Target Customer Action Console + Maker History & Policy ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 7 Columns: Customer Status Inspection & Submission Form */}
        <div className="space-y-6 lg:col-span-7">
          {!customer && !isLoading && (
            <Card className="border-dashed border-border/80 bg-card/60">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div
                  className={cn(
                    'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl',
                    isSuspend
                      ? 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                  )}
                >
                  {isSuspend ? (
                    <Ban className="h-7 w-7" />
                  ) : (
                    <UserCheck className="h-7 w-7" />
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground">
                  No Customer Selected Yet
                </h3>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Use the search bar above to find a customer by CIF number, phone number,
                  or full name to inspect their current channel status and submit a{' '}
                  {action.toLowerCase()} request.
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card className="border-border/80">
              <CardContent className="flex flex-col items-center justify-center py-14">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Loading customer profile & channel security status...
                </p>
              </CardContent>
            </Card>
          )}

          {customer && !isLoading && (
            <Card className="border-border/80 shadow-sm overflow-hidden animate-in fade-in-50">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      {customer.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      CIF: {customer.cifNumber} • Branch: {customer.branchName || customer.branchCode || 'N/A'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/customers/${customer.cifNumber}`)}
                    className="h-8 rounded-xl gap-1.5 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    360° Profile
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-5">
                {/* Visual Status Transition Banner */}
                <div
                  className={cn(
                    'flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border p-4',
                    isSuspend
                      ? 'border-rose-500/25 bg-rose-500/[0.05]'
                      : 'border-emerald-500/25 bg-emerald-500/[0.05]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Current AppUser Status
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          className={cn(
                            'font-semibold',
                            customer.mobileStatus === 'Active' && !customer.isSuspended
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          )}
                        >
                          Mobile: {customer.mobileStatus}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          USSD: {customer.ussdStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />

                  <div className="text-left sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Target Status After Approval
                    </p>
                    <div className="mt-1">
                      {isSuspend ? (
                        <Badge className="bg-rose-600 text-white hover:bg-rose-600">
                          Suspended (Mobile & USSD Blocked)
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                          Active (Full Access Restored)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Identity Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <div className="flex items-start gap-2.5">
                    <Hash className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        CIF Number
                      </p>
                      <p className="font-mono text-sm font-semibold">{customer.cifNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Registered Phone
                      </p>
                      <p className="font-mono text-sm font-semibold">{customer.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </p>
                      <p className="text-sm font-medium">{customer.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Home Branch
                      </p>
                      <p className="text-sm font-medium">
                        {customer.branchName || customer.branchCode || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {alertMessage && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Action Unavailable</AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Reason + Quick Presets */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Reason for {action}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReason(preset)}
                        className={cn(
                          'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
                          reason === preset
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder={`Enter detailed justification for ${action.toLowerCase()}ing this customer...`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-20 rounded-xl resize-none"
                  />
                </div>

                {/* Supporting Documents */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Supporting Mandate / Authorization Document
                  </h3>
                  <FileUpload
                    value={documents}
                    onChange={setDocuments}
                    label="Supporting Documents"
                    required
                    maxFiles={5}
                    maxSizeMB={10}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleAction}
                    disabled={isActionDisabled}
                    className={cn(
                      'w-full sm:w-auto rounded-xl px-6 gap-2 font-semibold',
                      isSuspend
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    )}
                    size="lg"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSuspend ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {isActionLoading ? 'Submitting...' : `Submit ${action} Request`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 5 Columns: Policy Impact Card & Maker Request History */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                {isSuspend ? (
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                )}
                {isSuspend ? 'What Happens on Suspension?' : 'What Happens on Restoration?'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Mobile Banking Channel</p>
                  <p>
                    Updates <code className="text-[11px]">USER_MODULE.AppUsers.MobileStatus</code> to{' '}
                    <strong>{isSuspend ? 'Suspended' : 'Active'}</strong> upon Checker approval.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                <Radio className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">USSD Banking Channel</p>
                  <p>
                    Updates <code className="text-[11px]">USER_MODULE.AppUsers.UssdStatus</code> to{' '}
                    <strong>{isSuspend ? 'Suspended' : 'Active'}</strong> simultaneously.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MakerMiniHistory approvalType={approvalType} />
        </div>
      </div>
    </div>
  );
}
