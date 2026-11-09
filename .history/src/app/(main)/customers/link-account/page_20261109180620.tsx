'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MakerMiniHistory } from '@/components/customers/MakerMiniHistory';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  Link as LinkIcon,
  Unlink,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Wallet,
  ShieldAlert,
  FileText,
  Sparkles,
  Hash,
  Phone,
  User,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CustomerDetails } from '@/components/customers/CustomerDetailsCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { Separator } from '@/components/ui/separator';

interface Account {
  custacno: string;
  branch_code: string;
  ccy: string;
  account_type: string;
  account_class: string;
  acclassdesc: string;
  status: string;
  isAlreadyLinked: boolean;
  isBlocked: boolean;
  blockReason: string | null;
}

type AccountFilter = 'all' | 'eligible' | 'linked' | 'blocked';

function LinkAccountWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cifNumber, setCifNumber] = useState('');
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [candidateMatches, setCandidateMatches] = useState<
    Array<{ cifNumber: string; name: string; phoneNumber: string; branchName?: string }>
  >([]);

  const loadCustomerAndAccounts = useCallback(
    async (targetCif: string) => {
      setIsLoading(true);
      setCustomer(null);
      setAccounts([]);
      setSelection({});
      setCandidateMatches([]);

      try {
        const custRes = await fetch(`/api/customers/${encodeURIComponent(targetCif)}`);
        if (!custRes.ok) {
          throw new Error((await custRes.json()).message || 'Customer not found');
        }
        const custData = await custRes.json();
        setCustomer(custData);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Customer Lookup Failed',
          description: error.message,
        });
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Auto-load if ?cif= is present in URL
  useEffect(() => {
    const urlCif = searchParams.get('cif');
    if (urlCif && urlCif !== cifNumber) {
      setCifNumber(urlCif);
      loadCustomerAndAccounts(urlCif);
    }
  }, [searchParams, cifNumber, loadCustomerAndAccounts]);

  useEffect(() => {
    async function fetchAccounts() {
      if (!customer?.cifNumber) return;

      setIsLoading(true);
      try {
        const accRes = await fetch(`/api/online-linking/find-accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cif: customer.cifNumber,
            branch_code: customer.branchCode || '103',
          }),
        });
        if (!accRes.ok)
          throw new Error((await accRes.json()).message || 'Could not fetch accounts');
        const accData = await accRes.json();
        setAccounts(Array.isArray(accData) ? accData : []);
        setSelection({});
        setDocuments([]);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Could not fetch core banking accounts',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, [customer, toast]);

  const handleSearch = async () => {
    const trimmed = cifNumber.trim();
    if (!trimmed) {
      toast({ variant: 'destructive', title: 'Please enter a CIF, Phone, or Customer Name' });
      return;
    }

    setIsLoading(true);
    setCustomer(null);
    setAccounts([]);
    setSelection({});
    setCandidateMatches([]);

    try {
      // First try direct CIF/Phone lookup if numeric
      if (/^\+?\d{5,15}$/.test(trimmed)) {
        const directRes = await fetch(`/api/customers/${encodeURIComponent(trimmed)}`);
        if (directRes.ok) {
          const custData = await directRes.json();
          setCustomer(custData);
          return;
        }
      }

      // Otherwise search via Global Customer Search (Name, partial CIF, Phone)
      const searchRes = await fetch(
        `/api/customers/search?q=${encodeURIComponent(trimmed)}`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results = searchData.results || [];
        if (results.length === 1) {
          await loadCustomerAndAccounts(results[0].cifNumber);
          return;
        } else if (results.length > 1) {
          setCandidateMatches(results);
          setIsLoading(false);
          return;
        }
      }

      // Final fallback to direct endpoint
      await loadCustomerAndAccounts(trimmed);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleSelectionChange = (accountNumber: string, isSelected: boolean) => {
    setSelection((prev) => ({ ...prev, [accountNumber]: isSelected }));
  };

  const eligibleAccounts = useMemo(
    () => accounts.filter((acc) => !acc.isAlreadyLinked && !acc.isBlocked),
    [accounts]
  );

  const alreadyLinkedAccounts = useMemo(
    () => accounts.filter((acc) => acc.isAlreadyLinked),
    [accounts]
  );

  const blockedAccounts = useMemo(
    () => accounts.filter((acc) => acc.isBlocked),
    [accounts]
  );

  const selectedAccounts = useMemo(
    () => eligibleAccounts.filter((acc) => selection[acc.custacno]),
    [eligibleAccounts, selection]
  );

  const filteredAccounts = useMemo(() => {
    if (accountFilter === 'eligible') return eligibleAccounts;
    if (accountFilter === 'linked') return alreadyLinkedAccounts;
    if (accountFilter === 'blocked') return blockedAccounts;
    return accounts;
  }, [accounts, accountFilter, eligibleAccounts, alreadyLinkedAccounts, blockedAccounts]);

  const handleSelectAllEligible = () => {
    const allSelected =
      eligibleAccounts.length > 0 &&
      eligibleAccounts.every((acc) => selection[acc.custacno]);
    const next: Record<string, boolean> = {};
    if (!allSelected) {
      for (const acc of eligibleAccounts) {
        next[acc.custacno] = true;
      }
    }
    setSelection(next);
  };

  const handleSubmitForApproval = async () => {
    if (!customer || selectedAccounts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No accounts selected',
        description: 'Please select at least one eligible account to link.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cif: customer.cifNumber,
          type: 'customer-account',
          customerName: customer.name,
          customerPhone: customer.phoneNumber,
          details: {
            cif: customer.cifNumber,
            customerName: customer.name,
            linkedAccounts: selectedAccounts,
          },
          attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
      toast({
        title: 'Account Link Request Submitted',
        description: `Request to link ${selectedAccounts.length} account(s) for ${customer.name} has been sent to the Checker queue.`,
      });

      setCustomer(null);
      setAccounts([]);
      setSelection({});
      setCifNumber('');
      setDocuments([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = !customer ? 1 : selectedAccounts.length === 0 ? 2 : 3;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── Distinct Core Banking Account Linking Workbench Header + Pipeline Stepper ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-cyan-500/25 p-6 md:p-7 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(80% 130% at 100% 0%, hsl(192 85% 38% / 0.7), transparent 60%), radial-gradient(75% 120% at 0% 100%, hsl(347 75% 38% / 0.55), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(220 55% 7%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/30">
              <Wallet className="h-3.5 w-3.5" />
              Core Banking (FlexCube) Account Operations Workbench
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Discover & Link Additional Bank Accounts
            </h1>
            <p className="text-xs md:text-sm text-white/75">
              Query live FlexCube core banking accounts for an existing SuperApp customer, verify
              account eligibility & restrictions, and submit linking requests for Checker approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/customers/unlink-account')}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              <Unlink className="h-3.5 w-3.5 text-amber-300" />
              Switch to Unlink Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/customers/approve-accounts')}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Checker Approval Queue
            </Button>
          </div>
        </div>

        {/* 3-Step Visual Pipeline Bar */}
        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              step: 1,
              title: '1. Locate Customer Profile',
              desc: customer
                ? `${customer.name} (CIF ${customer.cifNumber})`
                : 'Search by CIF, Phone, or Name',
            },
            {
              step: 2,
              title: '2. Select Core Accounts',
              desc: customer
                ? `${eligibleAccounts.length} eligible of ${accounts.length} discovered`
                : 'Live FlexCube account discovery',
            },
            {
              step: 3,
              title: '3. Attach Mandate & Submit',
              desc:
                selectedAccounts.length > 0
                  ? `${selectedAccounts.length} account(s) queued for linking`
                  : 'Upload mandate & send to Checker',
            },
          ].map((item) => {
            const active = currentStep === item.step;
            const completed = currentStep > item.step;
            return (
              <div
                key={item.step}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md transition-all',
                  active
                    ? 'border-cyan-400/50 bg-cyan-500/20 shadow-sm'
                    : completed
                    ? 'border-emerald-400/40 bg-emerald-500/15'
                    : 'border-white/10 bg-white/[0.04] opacity-75'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold',
                    active
                      ? 'bg-cyan-400 text-slate-950'
                      : completed
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-white/10 text-white'
                  )}
                >
                  {completed ? '✓' : item.step}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">{item.title}</p>
                  <p className="truncate text-[11px] text-white/70">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Split-Pane Workbench Layout ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 4 Columns: Customer Lookup, Identity Summary & Maker History */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-500" />
                Target Customer Lookup
              </CardTitle>
              <CardDescription className="text-xs">
                Enter CIF number, phone number, or customer name to discover their FlexCube
                accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="CIF (e.g. 0048533), Phone, or Name..."
                  value={cifNumber}
                  onChange={(e) => setCifNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="rounded-xl"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Candidate Matches if searched by Name */}
              {candidateMatches.length > 0 && (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-2 space-y-1">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Matched Customer ({candidateMatches.length})
                  </p>
                  {candidateMatches.map((m) => (
                    <button
                      key={m.cifNumber}
                      type="button"
                      onClick={() => {
                        setCifNumber(m.cifNumber);
                        loadCustomerAndAccounts(m.cifNumber);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-card transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          CIF: {m.cifNumber} {m.phoneNumber ? `• ${m.phoneNumber}` : ''}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Active Customer Identity Summary */}
              {customer && (
                <div className="mt-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.06] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
                        CIF {customer.cifNumber}
                      </Badge>
                      <h3 className="mt-1.5 text-sm font-extrabold text-foreground">
                        {customer.name}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {customer.mobileStatus || 'Active'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="rounded-xl bg-card/80 p-2.5 border border-border/60">
                      <p className="text-[10px] uppercase text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground truncate">
                        {customer.phoneNumber || '—'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card/80 p-2.5 border border-border/60">
                      <p className="text-[10px] uppercase text-muted-foreground">Branch</p>
                      <p className="font-medium text-foreground truncate">
                        {customer.branchName || 'Main'}
                      </p>
                    </div>
                  </div>

                  {/* Account Discovery Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-2">
                      <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {eligibleAccounts.length}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">Eligible</p>
                    </div>
                    <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/25 p-2">
                      <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        {alreadyLinkedAccounts.length}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">Linked</p>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-2">
                      <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                        {blockedAccounts.length}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">Blocked</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <MakerMiniHistory approvalType="customer-account" />
        </div>

        {/* Right 8 Columns: Core Banking Account Discovery & Mandate Submission */}
        <div className="lg:col-span-8">
          {!customer && !isLoading ? (
            <Card className="border-dashed border-2 border-border/70 bg-card/40">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/25">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Ready for Core Banking Account Discovery
                </h3>
                <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
                  Use the Target Customer Lookup panel on the left to search by CIF, Phone Number,
                  or Customer Name. All accounts held by the customer in FlexCube will be listed
                  here with real-time linking eligibility.
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="border-border/80">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-9 w-9 animate-spin text-cyan-500" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  Querying FlexCube Core Banking Accounts...
                </p>
                <p className="text-xs text-muted-foreground">
                  Checking account classes, statuses, and existing SuperApp links
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/80 shadow-sm animate-in fade-in-50">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Core Banking Accounts for {customer?.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Select one or more eligible accounts to link to this customer&apos;s SuperApp
                      profile.
                    </CardDescription>
                  </div>

                  {eligibleAccounts.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllEligible}
                      className="h-8 rounded-xl text-xs"
                    >
                      {eligibleAccounts.every((acc) => selection[acc.custacno])
                        ? 'Deselect All Eligible'
                        : `Select All Eligible (${eligibleAccounts.length})`}
                    </Button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: `All Accounts (${accounts.length})` },
                      { id: 'eligible', label: `Eligible to Link (${eligibleAccounts.length})` },
                      {
                        id: 'linked',
                        label: `Already Linked (${alreadyLinkedAccounts.length})`,
                      },
                      { id: 'blocked', label: `Restricted / Blocked (${blockedAccounts.length})` },
                    ] as Array<{ id: AccountFilter; label: string }>
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAccountFilter(tab.id)}
                      className={cn(
                        'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                        accountFilter === tab.id
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {filteredAccounts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[54px] text-center">Link</TableHead>
                        <TableHead>Account Number</TableHead>
                        <TableHead>Account Description & Class</TableHead>
                        <TableHead>Branch / CCY</TableHead>
                        <TableHead>Eligibility Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((acc) => {
                        const isChecked =
                          Boolean(selection[acc.custacno]) || acc.isAlreadyLinked;
                        const isDisabled = acc.isAlreadyLinked || acc.isBlocked;
                        return (
                          <TableRow
                            key={acc.custacno}
                            data-state={selection[acc.custacno] ? 'selected' : undefined}
                            onClick={() => {
                              if (!isDisabled) {
                                handleSelectionChange(acc.custacno, !selection[acc.custacno]);
                              }
                            }}
                            className={cn(
                              !isDisabled && 'cursor-pointer',
                              acc.isBlocked && 'bg-rose-500/[0.04] opacity-75'
                            )}
                          >
                            <TableCell
                              className="text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={isChecked}
                                disabled={isDisabled}
                                onCheckedChange={(checked) =>
                                  handleSelectionChange(acc.custacno, !!checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-mono font-bold text-foreground">
                              {acc.custacno}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {acc.acclassdesc || 'Standard Account'}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Class: {acc.account_class}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px]">
                                  {acc.ccy}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  Br. {acc.branch_code}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {acc.isBlocked ? (
                                <div className="flex flex-col gap-0.5">
                                  <Badge className="w-fit border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                    Blocked
                                  </Badge>
                                  {acc.blockReason && (
                                    <span className="text-[11px] text-rose-500">
                                      {acc.blockReason}
                                    </span>
                                  )}
                                </div>
                              ) : acc.isAlreadyLinked ? (
                                <Badge className="border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                                  Already Linked
                                </Badge>
                              ) : (
                                <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                  {acc.status || 'Eligible to Link'}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No Matching Accounts Found</AlertTitle>
                      <AlertDescription>
                        No accounts match the selected filter for this customer.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>

              <CardContent className="space-y-3 border-t border-border/60 bg-muted/10 pt-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-500" />
                  <h3 className="text-sm font-bold text-foreground">
                    Supporting Account Linking Mandate / KYC Attachment
                  </h3>
                </div>
                <FileUpload
                  value={documents}
                  onChange={setDocuments}
                  label="Supporting Documents"
                  required
                  maxFiles={5}
                  maxSizeMB={10}
                />
              </CardContent>

              <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{selectedAccounts.length}</span>{' '}
                  new account(s) selected for linking
                </div>
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={selectedAccounts.length === 0 || isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:opacity-95 gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  Submit Link Request ({selectedAccounts.length} Account
                  {selectedAccounts.length === 1 ? '' : 's'})
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LinkAccountWorkbench />
    </Suspense>
  );
}
