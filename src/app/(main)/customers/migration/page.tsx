'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Plus,
  Download,
  Activity,
  XCircle,
  Loader2,
  Eye,
  ExternalLink,
  Smartphone,
  Mail,
  Hash,
  UserCheck,
  Layers,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MigrationStats {
  totalWhitelisted: number;
  allowedCount: number;
  migratedCount: number;
  pendingCount: number;
  blockedCount: number;
  conversionRate: number;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  activeSessions: number;
}

interface WhitelistRecord {
  id: string;
  hostAccountId: string;
  bankworldUsername: string | null;
  cifNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  isAllowed: boolean;
  isMigrated: boolean;
  migratedAt: string | null;
  remarks: string | null;
  insertDate: string | null;
  updateDate: string | null;
  insertUser: string;
  updateUser: string;
}

interface SessionRecord {
  id: string;
  hostAccountId: string;
  bankworldUsername: string | null;
  cifNumber: string | null;
  status: string;
  currentStep: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  notificationTarget: string | null;
  notificationType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  stepCount: number;
  attemptCount: number;
}

interface StepLogRecord {
  id: string;
  sessionId: string;
  stepName: string;
  stepOrder: number;
  status: string;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface AttemptRecord {
  id: string;
  sessionId: string;
  attemptType: string;
  isSuccessful: boolean;
  failureReason: string | null;
  ipAddress: string | null;
  attemptedAt: string | null;
}

type MainTab = 'migrated' | 'whitelist' | 'sessions';
type WhitelistFilter = 'all' | 'pending' | 'migrated' | 'blocked';
type SessionFilter = 'all' | 'Completed' | 'Failed' | 'Active';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSessionStatusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'completed') {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        Completed
      </Badge>
    );
  }
  if (s === 'failed' || s === 'expired') {
    return (
      <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400">
        {status}
      </Badge>
    );
  }
  return (
    <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400">
      {status}
    </Badge>
  );
}

function MigrationCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialTab = (searchParams.get('tab') as MainTab) || 'migrated';
  const [activeTab, setActiveTab] = useState<MainTab>(
    ['migrated', 'whitelist', 'sessions'].includes(initialTab) ? initialTab : 'migrated'
  );

  useEffect(() => {
    const t = searchParams.get('tab') as MainTab;
    if (t && ['migrated', 'whitelist', 'sessions'].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState('');
  const [whitelistFilter, setWhitelistFilter] = useState<WhitelistFilter>('all');
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [stats, setStats] = useState<MigrationStats>({
    totalWhitelisted: 0,
    allowedCount: 0,
    migratedCount: 0,
    pendingCount: 0,
    blockedCount: 0,
    conversionRate: 0,
    totalSessions: 0,
    completedSessions: 0,
    failedSessions: 0,
    activeSessions: 0,
  });
  const [whitelists, setWhitelists] = useState<WhitelistRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  // Add Whitelist Dialog state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSavingWhitelist, setIsSavingWhitelist] = useState(false);
  const [newWhitelist, setNewWhitelist] = useState({
    hostAccountId: '',
    bankworldUsername: '',
    cifNumber: '',
    phoneNumber: '',
    email: '',
    remarks: '',
    isAllowed: true,
  });

  // Session Inspector Modal state
  const [inspectedSession, setInspectedSession] = useState<SessionRecord | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [stepLogs, setStepLogs] = useState<StepLogRecord[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  const fetchMigrationData = useCallback(
    async (queryText = '') => {
      setIsLoading(true);
      setDbError(null);
      try {
        const url = queryText
          ? `/api/migration?q=${encodeURIComponent(queryText)}`
          : '/api/migration';
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          setDbError(data.error || data.message || 'Could not query MIGRATION_MODULE');
        }
        if (data.stats) setStats(data.stats);
        setWhitelists(data.whitelists || []);
        setSessions(data.sessions || []);
      } catch (err: any) {
        setDbError(err.message || 'Network error while fetching migration records');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMigrationData();
  }, [fetchMigrationData]);

  const handleOpenSessionInspector = async (sess: SessionRecord) => {
    setInspectedSession(sess);
    setIsLoadingDetails(true);
    setStepLogs([]);
    setAttempts([]);
    try {
      const res = await fetch(
        `/api/migration?sessionId=${encodeURIComponent(sess.id)}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      setStepLogs(data.stepLogs || []);
      setAttempts(data.attempts || []);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load session logs',
        description: err.message,
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleToggleAllowed = async (record: WhitelistRecord) => {
    const nextAllowed = !record.isAllowed;
    try {
      const res = await fetch('/api/migration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record.id,
          isAllowed: nextAllowed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update whitelist');
      toast({
        title: nextAllowed ? 'Customer Whitelisted' : 'Customer Whitelist Disabled',
        description: `HostAccountId ${record.hostAccountId} is now ${
          nextAllowed ? 'allowed to migrate' : 'blocked from migration'
        }.`,
      });
      fetchMigrationData(searchQuery);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err.message,
      });
    }
  };

  const handleAddWhitelist = async () => {
    if (!newWhitelist.hostAccountId.trim()) {
      toast({
        variant: 'destructive',
        title: 'HostAccountId is required',
        description: 'Please enter the Bankworld HostAccountId.',
      });
      return;
    }
    setIsSavingWhitelist(true);
    try {
      const res = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWhitelist),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add whitelist entry');

      toast({
        title: 'Added to Migration Whitelist',
        description: data.message,
      });
      setAddModalOpen(false);
      setNewWhitelist({
        hostAccountId: '',
        bankworldUsername: '',
        cifNumber: '',
        phoneNumber: '',
        email: '',
        remarks: '',
        isAllowed: true,
      });
      fetchMigrationData(searchQuery);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add entry',
        description: err.message,
      });
    } finally {
      setIsSavingWhitelist(false);
    }
  };

  // Filtered lists
  const migratedCustomers = useMemo(
    () => whitelists.filter((w) => w.isMigrated),
    [whitelists]
  );

  const filteredWhitelists = useMemo(() => {
    if (whitelistFilter === 'migrated') return whitelists.filter((w) => w.isMigrated);
    if (whitelistFilter === 'pending')
      return whitelists.filter((w) => w.isAllowed && !w.isMigrated);
    if (whitelistFilter === 'blocked') return whitelists.filter((w) => !w.isAllowed);
    return whitelists;
  }, [whitelists, whitelistFilter]);

  const filteredSessions = useMemo(() => {
    if (sessionFilter === 'all') return sessions;
    if (sessionFilter === 'Completed')
      return sessions.filter((s) => s.status.toLowerCase() === 'completed');
    if (sessionFilter === 'Failed')
      return sessions.filter((s) =>
        ['failed', 'expired'].includes(s.status.toLowerCase())
      );
    return sessions.filter(
      (s) => !['completed', 'failed', 'expired'].includes(s.status.toLowerCase())
    );
  }, [sessions, sessionFilter]);

  const exportCsv = () => {
    const rows =
      activeTab === 'migrated'
        ? migratedCustomers
        : activeTab === 'whitelist'
        ? filteredWhitelists
        : [];
    if (rows.length === 0) {
      toast({ title: 'No records to export' });
      return;
    }
    const headers = [
      'HostAccountId',
      'BankworldUsername',
      'CIFNumber',
      'PhoneNumber',
      'Email',
      'IsAllowed',
      'IsMigrated',
      'MigratedAt',
      'Remarks',
    ];
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `"${r.hostAccountId || ''}"`,
          `"${r.bankworldUsername || ''}"`,
          `"${r.cifNumber || ''}"`,
          `"${r.phoneNumber || ''}"`,
          `"${r.email || ''}"`,
          r.isAllowed ? 'YES' : 'NO',
          r.isMigrated ? 'YES' : 'NO',
          `"${r.migratedAt || ''}"`,
          `"${(r.remarks || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zemen-bankworld-migration-${activeTab}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── Hero Header Banner ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-amber-500/25 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(85% 130% at 95% 0%, hsl(38 92% 45% / 0.55), transparent 60%), radial-gradient(75% 130% at 0% 100%, hsl(347 78% 40% / 0.65), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              MIGRATION_MODULE • Bankworld → Zemen SuperApp
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Application Migration & Whitelist Command Center
            </h1>
            <p className="text-xs md:text-sm text-white/75 leading-relaxed">
              Track customers who migrated from the legacy Bankworld application to the new
              SuperApp, manage whitelisted <code className="text-amber-300">HostAccountId</code>{' '}
              records, and inspect live migration sessions, step logs, and OTP verification
              attempts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={exportCsv}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:opacity-95 gap-2 border-0 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Whitelist Customer
            </Button>
          </div>
        </div>

        {/* ─── Top KPI Summary Strip ─── */}
        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Total Whitelisted</span>
              <ShieldCheck className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold">{stats.totalWhitelisted}</p>
            <p className="mt-0.5 text-[11px] text-white/55">
              {stats.allowedCount} allowed • {stats.blockedCount} blocked
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span>Migrated to SuperApp</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-white">{stats.migratedCount}</p>
            <p className="mt-0.5 text-[11px] text-emerald-200/80">
              {stats.conversionRate}% conversion rate
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/15 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-amber-200">
              <span>Whitelisted & Pending</span>
              <Clock className="h-4 w-4 text-amber-300" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-white">{stats.pendingCount}</p>
            <p className="mt-0.5 text-[11px] text-amber-200/80">
              Allowed, awaiting customer login
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Migration Sessions</span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold">{stats.totalSessions}</p>
            <p className="mt-0.5 text-[11px] text-white/55">
              {stats.completedSessions} completed • {stats.activeSessions} active
            </p>
          </div>

          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/15 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-rose-200">
              <span>Failed / Expired Sessions</span>
              <XCircle className="h-4 w-4 text-rose-300" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-white">{stats.failedSessions}</p>
            <p className="mt-0.5 text-[11px] text-rose-200/80">
              Inspect step logs for root cause
            </p>
          </div>
        </div>
      </div>

      {dbError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Database Notice:</strong> {dbError}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMigrationData(searchQuery)}
            className="h-7 rounded-lg text-xs"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* ─── Navigation Tabs + Global Search Bar ─── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/80 bg-card p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('migrated')}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
              activeTab === 'migrated'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <UserCheck className="h-4 w-4" />
            Migrated Customers ({stats.migratedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whitelist')}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
              activeTab === 'whitelist'
                ? 'bg-[hsl(347,78%,46%)] text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Migration Whitelist ({stats.totalWhitelisted})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
              activeTab === 'sessions'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Activity className="h-4 w-4" />
            Sessions, Step Logs & Attempts ({stats.totalSessions})
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search HostAccountId, CIF, Username, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMigrationData(searchQuery)}
              className="h-9 rounded-xl pl-9 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMigrationData(searchQuery)}
            disabled={isLoading}
            className="h-9 rounded-xl gap-1.5 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Search / Refresh
          </Button>
        </div>
      </div>

      {/* ─── TAB 1: MIGRATED CUSTOMERS (Who Migrated from Old Application to New SuperApp) ─── */}
      {activeTab === 'migrated' && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Customers Migrated from Bankworld to SuperApp
                </CardTitle>
                <CardDescription className="text-xs">
                  Records in <code className="font-mono">MIGRATION_MODULE.MigrationWhitelists</code>{' '}
                  where <code className="font-mono">IsMigrated = 1</code>.
                </CardDescription>
              </div>
              <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {migratedCustomers.length} Migrated Customer(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : migratedCustomers.length === 0 ? (
              <div className="py-16 text-center">
                <UserCheck className="mx-auto mb-2 h-9 w-9 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">
                  No migrated customers matched your current filter
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Switch to the &ldquo;Migration Whitelist&rdquo; tab to view pending whitelisted
                  customers or add new HostAccountIds.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CIF Number</TableHead>
                    <TableHead>Bankworld HostAccountId</TableHead>
                    <TableHead>Bankworld Username</TableHead>
                    <TableHead>Phone / Email</TableHead>
                    <TableHead>Migrated Timestamp</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">SuperApp Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migratedCustomers.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono font-bold text-primary">
                        {row.cifNumber || '—'}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {row.hostAccountId}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {row.bankworldUsername || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>{row.phoneNumber || '—'}</span>
                          {row.email && (
                            <span className="text-muted-foreground">{row.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {formatDateTime(row.migratedAt)}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {row.remarks || 'Migrated to SuperApp'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.cifNumber ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-lg text-xs gap-1"
                            onClick={() => router.push(`/customers/${row.cifNumber}`)}
                          >
                            360° Profile
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── TAB 2: MIGRATION WHITELIST (Who is Whitelisted) ─── */}
      {activeTab === 'whitelist' && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Migration Whitelist Registry (<code className="font-mono text-xs">MigrationWhitelists</code>)
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage who is eligible to migrate from Bankworld to SuperApp and toggle{' '}
                  <code className="font-mono">IsAllowed</code> access.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: `All (${whitelists.length})` },
                    {
                      id: 'pending',
                      label: `Whitelisted & Pending (${
                        whitelists.filter((w) => w.isAllowed && !w.isMigrated).length
                      })`,
                    },
                    {
                      id: 'migrated',
                      label: `Completed Migration (${
                        whitelists.filter((w) => w.isMigrated).length
                      })`,
                    },
                    {
                      id: 'blocked',
                      label: `Blocked / Disabled (${
                        whitelists.filter((w) => !w.isAllowed).length
                      })`,
                    },
                  ] as Array<{ id: WhitelistFilter; label: string }>
                ).map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setWhitelistFilter(pill.id)}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                      whitelistFilter === pill.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : filteredWhitelists.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="mx-auto mb-2 h-9 w-9 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">
                  No whitelist records found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click &ldquo;Whitelist Customer&rdquo; above to add a Bankworld HostAccountId.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HostAccountId</TableHead>
                    <TableHead>Bankworld Username</TableHead>
                    <TableHead>CIF Number</TableHead>
                    <TableHead>Contact (Phone / Email)</TableHead>
                    <TableHead>Whitelist Allowed</TableHead>
                    <TableHead>Migration Status</TableHead>
                    <TableHead>Inserted / Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWhitelists.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono font-bold text-foreground">
                        {row.hostAccountId}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {row.bankworldUsername || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-primary font-semibold">
                        {row.cifNumber ? (
                          <button
                            type="button"
                            onClick={() => router.push(`/customers/${row.cifNumber}`)}
                            className="hover:underline inline-flex items-center gap-1"
                          >
                            {row.cifNumber}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>{row.phoneNumber || '—'}</span>
                          {row.email && (
                            <span className="text-muted-foreground">{row.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={row.isAllowed}
                            onCheckedChange={() => handleToggleAllowed(row)}
                          />
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px]',
                              row.isAllowed
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {row.isAllowed ? 'Allowed' : 'Blocked'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.isMigrated ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge className="w-fit border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              Migrated
                            </Badge>
                            {row.migratedAt && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatDateTime(row.migratedAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          >
                            Not Yet Migrated
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="truncate max-w-[200px] text-foreground">
                            {row.remarks || '—'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDateTime(row.insertDate)} by {row.insertUser}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── TAB 3: MIGRATION SESSIONS, STEP LOGS & VERIFICATION ATTEMPTS ─── */}
      {activeTab === 'sessions' && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-500" />
                  Migration Sessions, Step Logs & OTP Verification Attempts
                </CardTitle>
                <CardDescription className="text-xs">
                  Live session tracker from <code className="font-mono">MigrationSessions</code>.
                  Click <strong>Inspect Timeline</strong> on any session to view its{' '}
                  <code className="font-mono">MigrationStepLogs</code> and{' '}
                  <code className="font-mono">MigrationAttempts</code>.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: `All Sessions (${sessions.length})` },
                    {
                      id: 'Completed',
                      label: `Completed (${
                        sessions.filter((s) => s.status.toLowerCase() === 'completed').length
                      })`,
                    },
                    {
                      id: 'Active',
                      label: `In-Progress (${
                        sessions.filter(
                          (s) =>
                            !['completed', 'failed', 'expired'].includes(
                              s.status.toLowerCase()
                            )
                        ).length
                      })`,
                    },
                    {
                      id: 'Failed',
                      label: `Failed / Expired (${
                        sessions.filter((s) =>
                          ['failed', 'expired'].includes(s.status.toLowerCase())
                        ).length
                      })`,
                    },
                  ] as Array<{ id: SessionFilter; label: string }>
                ).map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSessionFilter(pill.id)}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                      sessionFilter === pill.id
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="py-16 text-center">
                <Activity className="mx-auto mb-2 h-9 w-9 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">
                  No migration sessions found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sessions appear here as soon as whitelisted Bankworld users initiate migration.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HostAccountId / CIF</TableHead>
                    <TableHead>Bankworld Username</TableHead>
                    <TableHead>Status & Current Step</TableHead>
                    <TableHead>OTP Target & IP</TableHead>
                    <TableHead>Started / Completed</TableHead>
                    <TableHead>Failure Reason</TableHead>
                    <TableHead className="text-right">Step Logs & Attempts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((sess) => (
                    <TableRow key={sess.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-foreground">
                            {sess.hostAccountId}
                          </span>
                          <span className="font-mono text-xs text-primary">
                            CIF: {sess.cifNumber || '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {sess.bankworldUsername || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getSessionStatusBadge(sess.status)}
                          {sess.currentStep && (
                            <span className="text-[11px] text-muted-foreground">
                              Step: <strong className="text-foreground">{sess.currentStep}</strong>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>
                            {sess.notificationType ? `${sess.notificationType}: ` : ''}
                            {sess.notificationTarget || '—'}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            IP: {sess.ipAddress || '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>In: {formatDateTime(sess.createdAt)}</span>
                          {sess.completedAt && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Done: {formatDateTime(sess.completedAt)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-rose-500">
                        {sess.failureReason || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSessionInspector(sess)}
                          className="h-8 rounded-xl gap-1.5 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-cyan-500" />
                          Inspect ({sess.stepCount} steps / {sess.attemptCount} attempts)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── MODAL 1: Add Customer to Migration Whitelist ─── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Add Customer to Bankworld Migration Whitelist
            </DialogTitle>
            <DialogDescription>
              Inserts a new record into{' '}
              <code className="font-mono text-xs">MIGRATION_MODULE.MigrationWhitelists</code> so
              the customer can migrate from Bankworld to SuperApp.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="hostAccountId">
                Bankworld HostAccountId <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="hostAccountId"
                placeholder="Must match BANKWORLD.BOSHOSTACCOUNTMAPPING_.HOSTACCOUNTID"
                value={newWhitelist.hostAccountId}
                onChange={(e) =>
                  setNewWhitelist((p) => ({ ...p, hostAccountId: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cifNumber">CIF Number</Label>
                <Input
                  id="cifNumber"
                  placeholder="e.g. 0048533"
                  value={newWhitelist.cifNumber}
                  onChange={(e) =>
                    setNewWhitelist((p) => ({ ...p, cifNumber: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bwUser">Bankworld Username</Label>
                <Input
                  id="bwUser"
                  placeholder="Optional UserLoginId"
                  value={newWhitelist.bankworldUsername}
                  onChange={(e) =>
                    setNewWhitelist((p) => ({ ...p, bankworldUsername: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+2519..."
                  value={newWhitelist.phoneNumber}
                  onChange={(e) =>
                    setNewWhitelist((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="customer@example.com"
                  value={newWhitelist.email}
                  onChange={(e) =>
                    setNewWhitelist((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="remarks">Remarks / Batch Note</Label>
              <Input
                id="remarks"
                placeholder="e.g. Pilot Cohort 1 / VIP Branch Customer"
                value={newWhitelist.remarks}
                onChange={(e) =>
                  setNewWhitelist((p) => ({ ...p, remarks: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Allow Migration Immediately (IsAllowed = 1)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, the customer can immediately initiate migration on the SuperApp.
                </p>
              </div>
              <Switch
                checked={newWhitelist.isAllowed}
                onCheckedChange={(checked) =>
                  setNewWhitelist((p) => ({ ...p, isAllowed: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddWhitelist}
              disabled={isSavingWhitelist}
              className="gap-2"
            >
              {isSavingWhitelist && <Loader2 className="h-4 w-4 animate-spin" />}
              Save to Whitelist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: Session Step Logs & Verification Attempts Inspector ─── */}
      <Dialog
        open={Boolean(inspectedSession)}
        onOpenChange={(open) => !open && setInspectedSession(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-500" />
              Migration Session Timeline & Audit Inspector
            </DialogTitle>
            <DialogDescription>
              HostAccountId:{' '}
              <strong className="font-mono text-foreground">
                {inspectedSession?.hostAccountId}
              </strong>{' '}
              • CIF:{' '}
              <strong className="font-mono text-foreground">
                {inspectedSession?.cifNumber || '—'}
              </strong>{' '}
              • Status: {inspectedSession && getSessionStatusBadge(inspectedSession.status)}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-cyan-500" />
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Section 1: MigrationStepLogs */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-500" />
                  Step-by-Step Pipeline (<code className="font-mono">MigrationStepLogs</code>)
                </h4>
                {stepLogs.length === 0 ? (
                  <p className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
                    No step logs recorded for this session.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stepLogs.map((step) => {
                      const st = step.status.toLowerCase();
                      return (
                        <div
                          key={step.id}
                          className="flex flex-col gap-1 rounded-xl border border-border/70 bg-muted/25 p-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/15 font-mono text-[11px] font-bold text-cyan-500">
                                #{step.stepOrder}
                              </span>
                              <span className="font-bold text-foreground">{step.stepName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px]',
                                  st === 'success'
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                    : st === 'failed'
                                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                )}
                              >
                                {step.status}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">
                                {formatDateTime(step.startedAt)}
                              </span>
                            </div>
                          </div>
                          {step.errorMessage && (
                            <p className="mt-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 font-mono text-[11px] text-rose-500">
                              {step.errorMessage}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: MigrationAttempts */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                  Credential & OTP Verification Attempts (
                  <code className="font-mono">MigrationAttempts</code>)
                </h4>
                {attempts.length === 0 ? (
                  <p className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
                    No verification attempts recorded for this session.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attempt Type</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Failure Reason</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((att) => (
                        <TableRow key={att.id}>
                          <TableCell className="font-semibold text-xs">
                            {att.attemptType}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px]',
                                att.isSuccessful
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                              )}
                            >
                              {att.isSuccessful ? 'Success' : 'Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-rose-500">
                            {att.failureReason || '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {att.ipAddress || '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(att.attemptedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MigrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MigrationCenterContent />
    </Suspense>
  );
}
