'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Archive,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  Eye,
  Calendar,
  ChevronDown,
  MessageSquareWarning,
  ArrowUpRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ArchiveRequestItem {
  id: string;
  type: string;
  cif: string;
  customerName?: string;
  customerPhone?: string;
  branchCode?: string;
  submittedBy?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  isExpiredPending?: boolean;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  'new-customer': 'Create Customer',
  'updated-customer': 'Update Customer',
  'customer-account': 'Link Account',
  'unlink-account': 'Unlink Account',
  'suspend-customer': 'Suspend Customer',
  'unsuspend-customer': 'Unsuspend Customer',
  'unlock-customer': 'Unlock Customer',
  'resend-activation-code': 'Send Activation',
  'pin-reset': 'PIN Reset',
};

const TYPE_ALIASES: Record<string, string> = {
  'update-customer': 'updated-customer',
  'link-account': 'customer-account',
  'resend-activation': 'resend-activation-code',
};

function getRequestTypeLabel(type: string): string {
  const canonical = TYPE_ALIASES[type] || type;
  return REQUEST_TYPE_LABELS[canonical] || type;
}

type ArchiveTab = 'expired_pending' | 'rejected' | 'approved' | 'cancelled' | 'all';

export default function ArchivedRequestsSearchPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ArchiveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('expired_pending');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadArchive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/approvals/request?window=archive', {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load archived requests');
      const data: ArchiveRequestItem[] = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load archive',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  const handleCancel = async (req: ArchiveRequestItem) => {
    try {
      const res = await fetch(`/api/approvals/request/${req.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to cancel request');
      toast({
        title: 'Request Cancelled',
        description: `${getRequestTypeLabel(req.type)} for CIF ${req.cif} has been cancelled.`,
      });
      await loadArchive();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Could not cancel request',
        description: err.message,
      });
    }
  };

  const expiredPendingList = useMemo(
    () => requests.filter((r) => r.status === 'PENDING' && r.isExpiredPending),
    [requests]
  );
  const rejectedList = useMemo(
    () => requests.filter((r) => r.status === 'REJECTED'),
    [requests]
  );
  const approvedList = useMemo(
    () => requests.filter((r) => r.status === 'APPROVED'),
    [requests]
  );
  const cancelledList = useMemo(
    () => requests.filter((r) => r.status === 'CANCELLED'),
    [requests]
  );

  // Auto-switch to 'all' or 'rejected' on first load if expiredPendingList is empty
  useEffect(() => {
    if (!loading && expiredPendingList.length === 0 && activeTab === 'expired_pending') {
      if (rejectedList.length > 0) setActiveTab('rejected');
      else setActiveTab('all');
    }
  }, [loading, expiredPendingList.length, rejectedList.length, activeTab]);

  const filteredRequests = useMemo(() => {
    let base: ArchiveRequestItem[] = requests;
    if (activeTab === 'expired_pending') base = expiredPendingList;
    else if (activeTab === 'rejected') base = rejectedList;
    else if (activeTab === 'approved') base = approvedList;
    else if (activeTab === 'cancelled') base = cancelledList;

    const q = search.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return base.filter((r) => {
      const canonical = TYPE_ALIASES[r.type] || r.type;
      if (typeFilter !== 'all' && canonical !== typeFilter && r.type !== typeFilter) {
        return false;
      }

      if (q) {
        const matchCif = String(r.cif || '').toLowerCase().includes(q);
        const matchName = String(r.customerName || '').toLowerCase().includes(q);
        const matchPhone = String(r.customerPhone || '').toLowerCase().includes(q);
        const matchMaker = String(r.submittedBy || '').toLowerCase().includes(q);
        const matchBranch = String(r.branchCode || '').toLowerCase().includes(q);
        if (!matchCif && !matchName && !matchPhone && !matchMaker && !matchBranch) {
          return false;
        }
      }

      const subMs = r.submittedAt ? new Date(r.submittedAt).getTime() : 0;
      if (fromMs && subMs < fromMs) return false;
      if (toMs && subMs > toMs) return false;

      return true;
    });
  }, [
    requests,
    activeTab,
    expiredPendingList,
    rejectedList,
    approvedList,
    cancelledList,
    search,
    typeFilter,
    dateFrom,
    dateTo,
  ]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="relative pl-4 text-2xl font-extrabold tracking-tight text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[hsl(347,80%,50%)] before:to-[hsl(38,92%,55%)] md:text-3xl">
            Archived &amp; Historical Requests Search
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search unapproved requests older than 1 week (&gt;7 days), inspect rejected requests
            and Checker remarks, or audit full Maker–Checker history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
            <Link href="/overview/maker">Active Maker Queue</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
            <Link href="/overview/checker">Active Checker Queue</Link>
          </Button>
        </div>
      </div>

      {/* ─── KPI Filter Cards ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            key: 'expired_pending' as ArchiveTab,
            label: 'Unapproved (> 7 Days)',
            value: loading ? '—' : expiredPendingList.length,
            icon: <Archive className="h-5 w-5" />,
            color: '#F59E0B',
            desc: 'Older than 1-week window',
          },
          {
            key: 'rejected' as ArchiveTab,
            label: 'Rejected Requests',
            value: loading ? '—' : rejectedList.length,
            icon: <XCircle className="h-5 w-5" />,
            color: '#F43F5E',
            desc: 'With Checker rejection reason',
          },
          {
            key: 'approved' as ArchiveTab,
            label: 'Approved History',
            value: loading ? '—' : approvedList.length,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: '#10B981',
            desc: 'Actioned by Checker',
          },
          {
            key: 'cancelled' as ArchiveTab,
            label: 'Cancelled by Maker',
            value: loading ? '—' : cancelledList.length,
            icon: <Ban className="h-5 w-5" />,
            color: '#64748B',
            desc: 'Withdrawn by Maker',
          },
          {
            key: 'all' as ArchiveTab,
            label: 'All Historical Records',
            value: loading ? '—' : requests.length,
            icon: <Clock className="h-5 w-5" />,
            color: '#6366F1',
            desc: 'Complete request archive',
          },
        ].map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setActiveTab(card.key)}
            className={cn(
              'card-3d relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
              activeTab === card.key && 'ring-2 ring-primary'
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: `${card.color}22`, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {loading ? <Skeleton className="h-7 w-12" /> : card.value}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{card.desc}</p>
          </button>
        ))}
      </div>

      {/* ─── Multi-Criteria Search & Date Range Filter Bar ─── */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">
                Search Old &amp; Archived Requests ({filteredRequests.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Filter by CIF, customer name, phone number, maker email, request type, or
                submission date range.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadArchive}
              disabled={loading}
              className="h-8 rounded-xl gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh Archive
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search CIF, Customer Name, Phone, Branch, or Maker Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-xl pl-9 text-xs"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Filter className="h-3.5 w-3.5" />
                    {typeFilter === 'all' ? 'All Request Types' : getRequestTypeLabel(typeFilter)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl">
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  All Request Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                  <DropdownMenuItem key={k} onClick={() => setTypeFilter(k)}>
                    {v}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-xl text-xs"
                title="From Date"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-xl text-xs"
                title="To Date"
              />
              {(search || typeFilter !== 'all' || dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="h-9 rounded-xl px-2.5 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-4 text-xs font-semibold uppercase">
                    Request Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    Customer / CIF
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    Branch &amp; Maker
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    Submitted Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    Status / Audit Details
                  </TableHead>
                  <TableHead className="pr-4 text-right text-xs font-semibold uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-14 text-center text-sm text-muted-foreground"
                    >
                      No archived or historical requests matched your filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/20">
                      <TableCell className="py-3 pl-4 text-sm font-semibold text-foreground">
                        {getRequestTypeLabel(req.type)}
                      </TableCell>
                      <TableCell className="py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {req.customerName || `CIF ${req.cif}`}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            CIF: {req.cif} {req.customerPhone ? `• ${req.customerPhone}` : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          Branch: {req.branchCode || '—'}
                        </p>
                        <p>By: {req.submittedBy || '—'}</p>
                      </TableCell>
                      <TableCell className="py-3 text-xs">
                        <p className="font-medium text-foreground">
                          {new Date(req.submittedAt).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(req.submittedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px]',
                                req.status === 'APPROVED' &&
                                  'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
                                req.status === 'REJECTED' &&
                                  'border-rose-500/30 bg-rose-500/10 text-rose-500',
                                req.status === 'PENDING' &&
                                  'border-amber-500/30 bg-amber-500/10 text-amber-500',
                                req.status === 'CANCELLED' &&
                                  'border-slate-500/30 bg-slate-500/10 text-muted-foreground'
                              )}
                            >
                              {req.status}
                            </Badge>
                            {req.isExpiredPending && (
                              <Badge
                                variant="outline"
                                className="border-amber-500/40 bg-amber-500/15 text-[10px] text-amber-600 dark:text-amber-400"
                              >
                                &gt;7 Days Unapproved
                              </Badge>
                            )}
                          </div>

                          {req.status === 'REJECTED' && (
                            <div className="flex items-start gap-1 text-xs text-rose-600 dark:text-rose-400">
                              <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <div>
                                <p className="font-medium">
                                  {req.rejectionReason || 'Rejected by Checker'}
                                </p>
                                {req.rejectedBy && (
                                  <p className="text-[10px] text-muted-foreground">
                                    Rejected by: {req.rejectedBy}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {req.status === 'APPROVED' && req.approvedBy && (
                            <p className="text-[11px] text-muted-foreground">
                              Approved by: {req.approvedBy}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 pr-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {req.status === 'PENDING' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-xl border-rose-500/30 text-xs text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                                >
                                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                                  Cancel Request
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Pending Request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this{' '}
                                    <strong>{getRequestTypeLabel(req.type)}</strong> request for{' '}
                                    <strong>{req.customerName || `CIF ${req.cif}`}</strong>?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">
                                    Keep Request
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancel(req)}
                                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-xl text-xs gap-1"
                          >
                            <Link href={`/approvals/${req.type}/${req.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                              Inspect
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
