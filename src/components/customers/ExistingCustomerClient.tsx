'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Search,
  Loader2,
  CreditCard,
  Hash,
  User,
  Phone,
  Sparkles,
  UserPlus,
  ArrowRightLeft,
  Link as LinkIcon,
  Shield,
  Building2,
  ArrowUpRight,
  RefreshCw,
  Users,
  CheckCircle2,
  Eye,
  Edit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  CustomerDetailsCard,
  type CustomerDetails,
} from '@/components/customers/CustomerDetailsCard';
import { cn } from '@/lib/utils';

type SearchMode = 'smart' | 'cif' | 'phone' | 'name' | 'account';

interface DirectoryItem {
  id: string;
  cifNumber: string;
  name: string;
  phoneNumber: string;
  email?: string;
  branchName?: string;
  mobileStatus?: string;
  insertDate?: string;
  matchType?: 'CIF' | 'Phone' | 'Name';
}

const SEARCH_MODES: Array<{
  id: SearchMode;
  label: string;
  placeholder: string;
  icon: any;
  hint: string;
}> = [
  {
    id: 'smart',
    label: 'Smart Lookup (All)',
    placeholder: 'Search by CIF, Phone (+251...), or Customer Name...',
    icon: Sparkles,
    hint: 'Searches across CIF, Phone Number, and Decrypted Customer Names simultaneously',
  },
  {
    id: 'cif',
    label: 'CIF Number',
    placeholder: 'Enter 7-digit CIF Number (e.g. 0048533)...',
    icon: Hash,
    hint: 'Direct Core Banking & SuperApp CIF lookup',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    placeholder: 'Enter Phone Number (e.g. +251911223345 or 0911...)...',
    icon: Phone,
    hint: 'Matches SHA-256 hashed or formatted mobile number',
  },
  {
    id: 'name',
    label: 'Customer Name',
    placeholder: 'Enter First, Middle, or Last Name...',
    icon: User,
    hint: 'Matches customer full name across SuperApp directory',
  },
  {
    id: 'account',
    label: 'Account Number',
    placeholder: 'Enter Linked Bank Account Number...',
    icon: CreditCard,
    hint: 'Finds the customer profile owning a linked bank account',
  },
];

export function ExistingCustomerClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchMode, setSearchMode] = useState<SearchMode>('smart');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectoryLoading, setIsDirectoryLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [directoryList, setDirectoryList] = useState<DirectoryItem[]>([]);
  const [searchResults, setSearchResults] = useState<DirectoryItem[] | null>(null);

  const activeModeConfig =
    SEARCH_MODES.find((m) => m.id === searchMode) || SEARCH_MODES[0];

  const loadRecentDirectory = useCallback(async () => {
    setIsDirectoryLoading(true);
    try {
      const res = await fetch('/api/customers/search?recent=true');
      if (res.ok) {
        const data = await res.json();
        setDirectoryList(data.results || []);
      }
    } catch {
      // Non-critical
    } finally {
      setIsDirectoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentDirectory();
  }, [loadRecentDirectory]);

  const loadCustomerByCif = async (cif: string) => {
    setIsLoading(true);
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
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Search term required',
        description: 'Please enter a CIF, Phone Number, Name, or Account Number.',
      });
      return;
    }

    setIsLoading(true);
    setCustomer(null);

    try {
      if (searchMode === 'account') {
        const res = await fetch(
          `/api/customers/search?accountNumber=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'No customer found for that account number');
        }
        const data = await res.json();
        setCustomer(data);
        setSearchResults(null);
        return;
      }

      if (searchMode === 'cif' || /^\d{6,10}$/.test(trimmed)) {
        // Try exact CIF / Phone lookup first
        const directRes = await fetch(`/api/customers/${encodeURIComponent(trimmed)}`);
        if (directRes.ok) {
          const data = await directRes.json();
          setCustomer(data);
          setSearchResults(null);
          return;
        }
      }

      // Multi-match directory search (by Name, partial CIF, or Phone)
      const multiRes = await fetch(
        `/api/customers/search?q=${encodeURIComponent(trimmed)}`
      );
      if (multiRes.ok) {
        const multiData = await multiRes.json();
        const matches: DirectoryItem[] = multiData.results || [];
        setSearchResults(matches);

        if (matches.length === 1) {
          await loadCustomerByCif(matches[0].cifNumber);
        } else if (matches.length === 0) {
          // Fallback to direct endpoint
          const directRes = await fetch(`/api/customers/${encodeURIComponent(trimmed)}`);
          if (directRes.ok) {
            const data = await directRes.json();
            setCustomer(data);
          } else {
            throw new Error(`No customer matched "${trimmed}"`);
          }
        }
      }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayedDirectory = searchResults !== null ? searchResults : directoryList;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── Distinct Executive Hero Banner for Customer Directory ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(85% 140% at 95% 0%, hsl(347 78% 42% / 0.85), transparent 60%), radial-gradient(75% 130% at 0% 100%, hsl(215 75% 32% / 0.75), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))',
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[hsl(347,85%,55%)] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-500 opacity-15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-300 ring-1 ring-white/15 backdrop-blur-md">
              <Users className="h-3.5 w-3.5" />
              Customer 360° Identity & Directory Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Customer Directory & Profile Management
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Locate any Zemen SuperApp or USSD customer by CIF, phone number, full name, or
              linked account number to inspect 360° KYC details, manage devices, or initiate
              Maker profile updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/customers/migration')}
              className="rounded-xl border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white gap-2"
            >
              <ArrowRightLeft className="h-4 w-4 text-amber-300" />
              Bankworld Migration
            </Button>
            <Button
              onClick={() => router.push('/customers/create')}
              className="rounded-xl bg-gradient-to-r from-[hsl(347,78%,48%)] to-[hsl(335,72%,40%)] text-white shadow-lg hover:opacity-95 gap-2 border-0"
            >
              <UserPlus className="h-4 w-4" />
              Register New Customer
            </Button>
          </div>
        </div>

        {/* ─── Embedded Multi-Mode Search Console inside Banner ─── */}
        <div className="relative z-10 mt-6 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-xl">
          {/* Mode Selector Pills */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {SEARCH_MODES.map((mode) => {
              const Icon = mode.icon;
              const active = searchMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSearchMode(mode.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                    active
                      ? 'bg-[hsl(347,78%,48%)] text-white shadow-sm ring-1 ring-white/25'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                type="text"
                placeholder={activeModeConfig.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-11 rounded-xl border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/45 focus-visible:ring-[hsl(347,78%,50%)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-11 rounded-xl bg-white px-6 font-semibold text-slate-900 hover:bg-white/90 gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(347,78%,46%)]" />
                ) : (
                  <Search className="h-4 w-4 text-[hsl(347,78%,46%)]" />
                )}
                Search Directory
              </Button>
              {(searchTerm || searchResults !== null || customer) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults(null);
                    setCustomer(null);
                  }}
                  className="h-11 rounded-xl text-white/75 hover:bg-white/10 hover:text-white"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <p className="mt-2 text-[11px] text-white/55">{activeModeConfig.hint}</p>
        </div>
      </div>

      {/* ─── Selected Customer 360° Preview Card ─── */}
      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              Querying customer profile & decrypting identity fields...
            </p>
          </div>
        </div>
      )}

      {customer && !isLoading && (
        <div className="animate-in fade-in-50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Selected Customer Profile
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCustomer(null)}
              className="h-7 text-xs text-muted-foreground"
            >
              Close Preview
            </Button>
          </div>
          <CustomerDetailsCard customer={customer} />
        </div>
      )}

      {/* ─── Main 2-Column Workspace: Directory Table + Quick Operations Dock ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Columns: Interactive Customer Directory Table */}
        <Card className="lg:col-span-8 border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/20 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {searchResults !== null
                  ? `Search Matches (${searchResults.length})`
                  : 'Registered SuperApp Customers'}
              </CardTitle>
              <CardDescription className="text-xs">
                {searchResults !== null
                  ? 'Click any matched customer row to load their 360° card or open full profile.'
                  : 'Recent customer registrations from USER_MODULE. Click any row to inspect.'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchResults(null);
                loadRecentDirectory();
              }}
              disabled={isDirectoryLoading}
              className="h-8 rounded-xl gap-1.5 text-xs"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', isDirectoryLoading && 'animate-spin')}
              />
              Refresh
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {isDirectoryLoading && displayedDirectory.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayedDirectory.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">No customers found</p>
                <p className="text-xs text-muted-foreground">
                  Try searching with a different CIF, phone number, or customer name.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {displayedDirectory.map((item) => {
                  const isSelected = customer?.cifNumber === item.cifNumber;
                  const statusLower = (item.mobileStatus || 'Active').toLowerCase();
                  return (
                    <div
                      key={item.cifNumber}
                      onClick={() => loadCustomerByCif(item.cifNumber)}
                      className={cn(
                        'group flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-all cursor-pointer hover:bg-muted/50',
                        isSelected && 'bg-primary/[0.06] border-l-4 border-l-primary'
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(347,72%,44%/0.15)] to-sky-500/15 text-xs font-bold text-primary ring-1 ring-primary/20">
                          {(item.name || 'CU')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </p>
                            {item.matchType && searchResults !== null && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                Matched {item.matchType}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono font-medium text-foreground/80">
                              CIF: {item.cifNumber}
                            </span>
                            {item.phoneNumber && <span>• {item.phoneNumber}</span>}
                            {item.branchName && (
                              <span className="hidden sm:inline-flex items-center gap-1">
                                • <Building2 className="h-3 w-3" /> {item.branchName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[11px] font-medium',
                            statusLower === 'active'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : statusLower === 'suspended'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          )}
                        >
                          {item.mobileStatus || 'Active'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg px-2.5 text-xs opacity-80 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/customers/${item.cifNumber}`);
                          }}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          360° View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg px-2.5 text-xs opacity-80 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/customers/${item.cifNumber}/edit`);
                          }}
                        >
                          <Edit className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 4 Columns: Customer Lifecycle & Action Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Customer Operations Hub
              </CardTitle>
              <CardDescription className="text-xs">
                Direct Maker workflows for customer onboarding, account linking, and migration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <button
                type="button"
                onClick={() => router.push('/customers/create')}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary">
                      Onboard New Customer
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    3-step FlexCube CIF enquiry, account linking & KYC upload wizard.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push('/customers/link-account')}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-left transition-all hover:border-cyan-500/40 hover:bg-card hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-500 ring-1 ring-cyan-500/30">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground group-hover:text-cyan-500">
                      Core Banking Account Link
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-500" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Discover unlinked FlexCube accounts and submit linking requests.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push('/customers/migration')}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-left transition-all hover:border-amber-500/40 hover:bg-card hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground group-hover:text-amber-500">
                      Bankworld → SuperApp Migration
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Inspect whitelisted HostAccountIds, migrated users & step logs.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push('/customers/suspend-customer')}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-left transition-all hover:border-indigo-500/40 hover:bg-card hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 ring-1 ring-indigo-500/30">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground group-hover:text-indigo-500">
                      Device & Credential Security
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Suspend, unlock, reset PIN, or trigger activation codes.
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Maker-Checker Governance Callout */}
          <Card className="border-emerald-500/25 bg-emerald-500/[0.04]">
            <CardContent className="p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-foreground">Dual-Control KYC Governance</p>
                <p className="text-muted-foreground leading-relaxed">
                  All profile modifications, channel status changes, and KYC document updates
                  require Checker verification before taking effect on the customer&apos;s
                  SuperApp profile.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
