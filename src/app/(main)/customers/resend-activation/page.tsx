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
import { Badge } from '@/components/ui/badge';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { useToast } from '@/hooks/use-toast';
import type { CustomerDetails } from '@/components/customers/CustomerDetailsCard';
import { cn } from '@/lib/utils';
import {
  Search,
  Loader2,
  Smartphone,
  Mail,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Send,
  Phone,
  Building2,
  Hash,
  ExternalLink,
} from 'lucide-react';

interface CandidateMatch {
  id: string;
  cifNumber: string;
  name: string;
  phoneNumber: string;
}

export default function ResendActivationCodePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [deliveryChannel, setDeliveryChannel] = useState<'SMS' | 'Email' | 'Both'>('SMS');

  const loadCustomerByCif = async (cif: string) => {
    setIsLoading(true);
    setCandidates([]);
    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(cif)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || 'Existing registered customer not found in AppUsers'
        );
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
        description:
          'Enter an existing customer CIF number, phone number, or full name.',
      });
      return;
    }

    setIsLoading(true);
    setCustomer(null);
    setCandidates([]);
    setDocuments([]);
    setDeliveryChannel('SMS');

    try {
      if (/^\+?\d{5,15}$/.test(trimmed)) {
        const directRes = await fetch(`/api/customers/${encodeURIComponent(trimmed)}`);
        if (directRes.ok) {
          const data = await directRes.json();
          setCustomer(data);
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
        title: 'Documents required',
        description: 'Please upload at least one supporting document.',
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
          type: 'resend-activation-code',
          customerName: customer.name,
          customerPhone: customer.phoneNumber,
          details: {
            reason: 'Resend activation code for existing registered customer',
            deliveryChannel,
            email: customer.email,
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
        throw new Error(
          error.message || 'Failed to submit resend activation request'
        );
      }

      toast({
        title: 'Activation Resend Queued',
        description: `Activation code update & dispatch for ${customer.name} (CIF: ${customer.cifNumber}) has been sent for Checker approval.`,
      });

      setCustomer(null);
      setSearchQuery('');
      setDocuments([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: error.message,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const hasEmail = Boolean(customer?.email && customer.email.trim() !== '');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── Distinct Sky / Blue Onboarding Activation Dispatch Hub Banner ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-sky-500/30 p-6 md:p-7 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(85% 130% at 100% 0%, hsl(202 88% 40% / 0.8), transparent 60%), radial-gradient(75% 120% at 0% 100%, hsl(38 90% 45% / 0.45), transparent 60%), linear-gradient(135deg, hsl(218 52% 10%), hsl(210 50% 7%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-sky-400/35 backdrop-blur-md">
              <Send className="h-3.5 w-3.5 text-sky-300" />
              Existing Customer OTP Update & Activation Dispatch
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Resend Onboarding Activation Code
            </h1>
            <p className="text-xs md:text-sm text-white/75 leading-relaxed">
              Regenerate and dispatch a fresh 6-digit temporary activation password for an{' '}
              <strong>existing registered SuperApp customer</strong> by updating their
              existing <code className="text-sky-300">OTP_MODULE.OtpCodes</code> &{' '}
              <code className="text-sky-300">OtpUsers</code> records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/customers/approve-resend-activation')}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Approve Activation Queue
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
                placeholder="Locate existing customer by CIF Number, Phone (+251...), or Full Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-11 rounded-xl border-white/20 bg-slate-900/85 pl-10 text-white caret-white placeholder:text-white/50 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:border-sky-400/60"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-11 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 font-semibold text-white shadow-lg hover:from-sky-500 hover:to-blue-500 gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Verify Existing Customer
            </Button>
          </div>

          {candidates.length > 1 && (
            <div className="mt-3 rounded-xl border border-white/15 bg-slate-900/90 p-3">
              <p className="mb-2 text-xs font-semibold text-white/80">
                Multiple existing customers matched ({candidates.length}). Select one:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((c) => (
                  <button
                    key={c.cifNumber}
                    type="button"
                    onClick={() => loadCustomerByCif(c.cifNumber)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-sky-400/40 hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{c.name}</p>
                      <p className="font-mono text-[11px] text-white/65">
                        CIF: {c.cifNumber} • {c.phoneNumber}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-sky-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 2-Column Workspace ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {!customer && !isLoading && (
            <Card className="border-dashed border-border/80 bg-card/60">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20">
                  <Smartphone className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Search Existing Registered Customer
                </h3>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Enter a CIF number, phone number, or customer name above. The customer
                  must already exist in <code className="text-[11px]">USER_MODULE.AppUsers</code>.
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card className="border-border/80">
              <CardContent className="flex flex-col items-center justify-center py-14">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Verifying existing customer registration in USER_MODULE.AppUsers...
                </p>
              </CardContent>
            </Card>
          )}

          {customer && !isLoading && (
            <Card className="border-border/80 shadow-sm overflow-hidden animate-in fade-in-50">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold">
                        {customer.name}
                      </CardTitle>
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                        Verified in AppUsers
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-mono mt-0.5">
                      CIF: {customer.cifNumber} • Mobile Status: {customer.mobileStatus}
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
                {/* Customer Details Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <div className="flex items-start gap-2.5">
                    <Hash className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        CIF Number
                      </p>
                      <p className="font-mono text-sm font-semibold">
                        {customer.cifNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Registered Phone
                      </p>
                      <p className="font-mono text-sm font-semibold">
                        {customer.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Registered Email
                      </p>
                      <p className="text-sm font-medium">{customer.email || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Branch
                      </p>
                      <p className="text-sm font-medium">
                        {customer.branchName || customer.branchCode || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Delivery Channel Cards */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-foreground">
                    Select Activation Dispatch Channel
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryChannel('SMS')}
                      className={cn(
                        'flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                        deliveryChannel === 'SMS'
                          ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30'
                          : 'border-border/70 bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">SMS Dispatch</p>
                        <p className="truncate font-mono text-xs text-muted-foreground mt-0.5">
                          To: {customer.phoneNumber}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={!hasEmail}
                      onClick={() => hasEmail && setDeliveryChannel('Email')}
                      className={cn(
                        'flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                        !hasEmail && 'opacity-50 cursor-not-allowed',
                        deliveryChannel === 'Email'
                          ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30'
                          : 'border-border/70 bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">Email Dispatch</p>
                        <p className="truncate text-xs text-muted-foreground mt-0.5">
                          {hasEmail ? `To: ${customer.email}` : 'No email on profile'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Supporting Customer Request Document
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
                    disabled={isActionLoading}
                    onClick={handleAction}
                    size="lg"
                    className="w-full sm:w-auto rounded-xl bg-sky-600 text-white hover:bg-sky-700 gap-2 px-6 font-semibold"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isActionLoading
                      ? 'Submitting Request...'
                      : 'Request Activation Code Resend'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 5 Columns: Update-Only Architecture Guarantee & Maker History */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Database className="h-4 w-4 text-sky-500" />
                Activation Resend Execution Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  1. Existing Customer Verification
                </p>
                <p className="mt-0.5">
                  Verifies customer already exists in{' '}
                  <code>USER_MODULE.AppUsers</code> (no duplicate user row is ever inserted).
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="font-semibold text-foreground">
                  2. In-Place OTP Update (No Insert)
                </p>
                <p className="mt-0.5">
                  Updates existing <code>OTP_MODULE.OtpCodes</code> (new SHA-256{' '}
                  <code>CodeHash</code>, <code>IsUsed = 0</code>, <code>Attempts = 0</code>)
                  and resets <code>OTP_MODULE.OtpUsers</code> status.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="font-semibold text-foreground">
                  3. Temporary Password Window Extended
                </p>
                <p className="mt-0.5">
                  Updates <code>SECURITY_MODULE.UserSecurities</code> with{' '}
                  <code>OnTmpPassword = 1</code> and extends{' '}
                  <code>ActivationExpiredAt</code> by 7 days.
                </p>
              </div>
            </CardContent>
          </Card>

          <MakerMiniHistory approvalType="resend-activation-code" />
        </div>
      </div>
    </div>
  );
}
