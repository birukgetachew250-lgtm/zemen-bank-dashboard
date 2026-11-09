'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MakerMiniHistory } from '@/components/customers/MakerMiniHistory';
import {
  LockOpen,
  Lock,
  Search,
  Loader2,
  User,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Hash,
  FileText,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CustomerInfo {
  cif: string;
  full_name: string;
  mobile_number: string;
  email_id: string;
  branch: string;
  status: string;
  mobileStatus?: string;
  isLocked?: boolean;
  failedAttempts?: number;
  securityStatus?: string | null;
}

interface CandidateMatch {
  id: string;
  cifNumber: string;
  name: string;
  phoneNumber: string;
}

const UNLOCK_REASON_PRESETS = [
  'Customer exceeded maximum PIN attempts and verified identity in-branch',
  'Biometric / device authentication lockout after mobile OS update',
  'Customer locked out after temporary password entry error',
  'Call center & branch joint verification completed for account unlock',
];

export default function UnlockCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [searchError, setSearchError] = useState('');
  const [reason, setReason] = useState('');
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const loadCustomerByCif = async (cif: string) => {
    setSearching(true);
    setCandidates([]);
    setSearchError('');
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(cif)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Customer not found');
      }
      const data = await res.json();
      setCustomer({
        cif: data.cifNumber,
        full_name: data.name,
        mobile_number: data.phoneNumber,
        email_id: data.email,
        branch: data.branchName || data.branchCode || '',
        status: data.status,
        mobileStatus: data.mobileStatus,
        isLocked: Boolean(data.isLocked),
        failedAttempts: Number(data.failedAttempts || 0),
        securityStatus: data.securityStatus || null,
      });
    } catch (e: any) {
      setSearchError(e.message || 'Customer not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchError('Please enter a CIF Number, Phone Number, or Customer Name');
      return;
    }
    setSearchError('');
    setSearching(true);
    setCustomer(null);
    setCandidates([]);

    try {
      if (/^\+?\d{5,15}$/.test(trimmed)) {
        const directRes = await fetch(`/api/customers/${encodeURIComponent(trimmed)}`);
        if (directRes.ok) {
          const data = await directRes.json();
          setCustomer({
            cif: data.cifNumber,
            full_name: data.name,
            mobile_number: data.phoneNumber,
            email_id: data.email,
            branch: data.branchName || data.branchCode || '',
            status: data.status,
            mobileStatus: data.mobileStatus,
            isLocked: Boolean(data.isLocked),
            failedAttempts: Number(data.failedAttempts || 0),
            securityStatus: data.securityStatus || null,
          });
          return;
        }
      }

      const searchRes = await fetch(
        `/api/customers/search?q=${encodeURIComponent(trimmed)}`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const matches: CandidateMatch[] = searchData.results || [];
        if (matches.length === 1) {
          await loadCustomerByCif(matches[0].cifNumber);
          return;
        } else if (matches.length > 1) {
          setCandidates(matches);
          return;
        }
      }

      await loadCustomerByCif(trimmed);
    } catch (e: any) {
      setSearchError(e.message || 'Customer not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!customer) {
      toast({
        variant: 'destructive',
        title: 'No customer selected',
        description: 'Please search for and select a customer first.',
      });
      return;
    }
    if (reason.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Reason required',
        description: 'Please provide a clear reason (at least 10 characters) for unlocking.',
      });
      return;
    }
    if (documents.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Documents required',
        description: 'Please upload at least one supporting document.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cif: customer.cif,
          type: 'unlock-customer',
          customerName: customer.full_name,
          customerPhone: customer.mobile_number,
          details: {
            reason: reason.trim(),
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
        const err = await response.json();
        throw new Error(err.message || 'Submission failed');
      }
      setSubmitted(true);
      toast({
        title: 'Unlock Request Submitted',
        description: `Unlock request for ${customer.full_name} has been queued for Checker approval.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: err?.message || 'Please try again',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── Distinct Indigo / Cyan Authentication Lockout Recovery Banner ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-indigo-500/30 p-6 md:p-7 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(85% 130% at 100% 0%, hsl(245 80% 45% / 0.78), transparent 60%), radial-gradient(75% 120% at 0% 100%, hsl(192 85% 36% / 0.55), transparent 60%), linear-gradient(135deg, hsl(226 52% 10%), hsl(240 48% 8%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-400/35 backdrop-blur-md">
              <LockOpen className="h-3.5 w-3.5 text-cyan-300" />
              SECURITY_MODULE Lockout & Failed-Attempt Reset
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Unlock Customer Authentication Lockout
            </h1>
            <p className="text-xs md:text-sm text-white/75 leading-relaxed">
              Clear authentication lockouts caused by consecutive failed PIN/OTP attempts,
              reset <code className="text-cyan-300">FailedAttempts = 0</code> and{' '}
              <code className="text-cyan-300">IsLocked = 0</code> in{' '}
              <code className="text-cyan-300">UserSecurities</code>, and restore login access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/customers/request-pin-reset')}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              Need PIN Reset Instead?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/customers/approve-unlock')}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Approve Unlock Queue
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
                placeholder="Search locked customer by CIF Number, Phone (+251...), or Full Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-11 rounded-xl border-white/20 bg-slate-900/85 pl-10 text-white caret-white placeholder:text-white/50 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:border-cyan-400/60"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-cyan-500 gap-2"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Inspect Security Lock
            </Button>
          </div>

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
                    onClick={() => loadCustomerByCif(c.cifNumber)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-cyan-400/40 hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{c.name}</p>
                      <p className="font-mono text-[11px] text-white/65">
                        CIF: {c.cifNumber} • {c.phoneNumber}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {searchError && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {/* ─── 2-Column Workspace ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {submitted ? (
            <Card className="border-emerald-500/30 bg-emerald-500/[0.04]">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30">
                  <LockOpen className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Unlock Request Queued for Approval
                  </h2>
                  <p className="mt-1 max-w-md text-xs text-muted-foreground">
                    The authentication unlock request for{' '}
                    <strong>{customer?.full_name}</strong> (CIF: {customer?.cif}) has been
                    submitted to the Checker queue.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setSubmitted(false);
                    setCustomer(null);
                    setSearchQuery('');
                    setReason('');
                    setDocuments([]);
                  }}
                >
                  Submit Another Unlock Request
                </Button>
              </CardContent>
            </Card>
          ) : !customer && !searching ? (
            <Card className="border-dashed border-border/80 bg-card/60">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
                  <LockOpen className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Search Customer to Inspect Lockout Telemetry
                </h3>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Enter a customer CIF, phone number, or name above to inspect their
                  live <code className="text-[11px]">UserSecurities</code> lockout status
                  and failed attempt counter.
                </p>
              </CardContent>
            </Card>
          ) : searching ? (
            <Card className="border-border/80">
              <CardContent className="flex flex-col items-center justify-center py-14">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Inspecting UserSecurities lockout counters...
                </p>
              </CardContent>
            </Card>
          ) : (
            customer && (
              <Card className="border-border/80 shadow-sm overflow-hidden animate-in fade-in-50">
                <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {customer.full_name}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono">
                        CIF: {customer.cif} • Branch: {customer.branch || 'N/A'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/customers/${customer.cif}`)}
                      className="h-8 rounded-xl gap-1.5 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      360° Profile
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-5">
                  {/* Security Lockout Diagnostic Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.05] p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Security Lock State
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        {customer.isLocked ? (
                          <Badge className="bg-rose-600 text-white gap-1">
                            <Lock className="h-3 w-3" /> Locked
                          </Badge>
                        ) : (
                          <Badge className="bg-indigo-600 text-white gap-1">
                            <LockOpen className="h-3 w-3" /> {customer.securityStatus || 'Active'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Failed Login Attempts
                      </p>
                      <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
                        {customer.failedAttempts ?? 0}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          → resets to 0
                        </span>
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        AppUser Status
                      </p>
                      <div className="mt-1.5">
                        <Badge variant="outline" className="font-semibold">
                          {customer.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <div className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Phone Number
                        </p>
                        <p className="font-mono text-sm font-semibold">
                          {customer.mobile_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Email Address
                        </p>
                        <p className="text-sm font-medium">{customer.email_id || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Unlock Reason + Presets */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      Reason for Unlocking (Required, min 10 chars)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {UNLOCK_REASON_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setReason(preset)}
                          className={cn(
                            'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors text-left',
                            reason === preset
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                              : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Provide a clear verification reason for unlocking this customer..."
                      className="rounded-xl min-h-24 resize-none"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {/* Supporting Documents */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Supporting Verification Documents
                    </h3>
                    <FileUpload
                      value={documents}
                      onChange={setDocuments}
                      required
                      label="Supporting Documents"
                      maxFiles={5}
                      maxSizeMB={10}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      size="lg"
                      className="w-full sm:w-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 gap-2 px-6 font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <LockOpen className="h-4 w-4" /> Submit Unlock Request
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Right 5 Columns: Technical Reset Breakdown & Maker History */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-500" />
                Database Actions on Unlock Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="font-semibold text-foreground">
                  1. SECURITY_MODULE.UserSecurities
                </p>
                <p className="mt-0.5">
                  Resets <code>FailedAttempts = 0</code>, <code>IsLocked = 0</code>, and
                  stamps <code>UnlockedTime = SYSTIMESTAMP</code>.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="font-semibold text-foreground">2. USER_MODULE.AppUsers</p>
                <p className="mt-0.5">
                  Ensures <code>MobileStatus</code> and <code>UssdStatus</code> are set to{' '}
                  <strong>Active</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          <MakerMiniHistory approvalType="unlock-customer" />
        </div>
      </div>
    </div>
  );
}
