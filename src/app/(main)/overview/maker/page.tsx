'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  UserX,
  CalendarClock,
  MessageSquareWarning,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PendingRequest {
  id: string;
  type: string;
  cif: string;
  customerName?: string;
  branchCode?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedBy?: string;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  'new-customer': 'Create Customer',
  'updated-customer': 'Update Customer',
  'customer-account': 'Link Account',
  'unlink-account': 'Unlink Account',
  'suspend-customer': 'Suspend Customer',
  'unsuspend-customer': 'Unsuspend Customer',
  'unlock-customer': 'Unlock Customer',
  'resend-activation-code': 'Send Activation',
  'pin-reset': 'PIN Reset',
  'reset-security-questions': 'Security Reset',
};

const TYPE_ALIASES: Record<string, string> = {
  'update-customer': 'updated-customer',
  'link-account': 'customer-account',
  'resend-activation': 'resend-activation-code',
  'security-reset': 'reset-security-questions',
};

function getRequestTypeLabel(type: string): string {
  const canonical = TYPE_ALIASES[type] || type;
  return REQUEST_TYPE_LABELS[canonical] || type;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'badge-pending' },
    APPROVED: { label: 'Approved', className: 'badge-approved' },
    REJECTED: { label: 'Rejected', className: 'badge-rejected' },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const cfg = map[status] || { label: status, className: '' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MakerDashboardPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  >('ALL');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [rejectionModalItem, setRejectionModalItem] = useState<PendingRequest | null>(null);
  const { toast } = useToast();

  const loadRequests = useCallback(
    async (selectedType = typeFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ role: 'maker' });
        if (selectedType && selectedType !== 'all') {
          params.set('type', selectedType);
        }
        const res = await fetch(`/api/approvals/request?${params.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setRequests(data);
      } catch {
        toast({ variant: 'destructive', title: 'Failed to load requests' });
      } finally {
        setLoading(false);
      }
    },
    [typeFilter, toast]
  );

  useEffect(() => {
    loadRequests(typeFilter);
  }, [typeFilter, loadRequests]);

  const pending = requests.filter((r) => r.status === 'PENDING');
  const today = requests.filter(
    (r) => new Date(r.submittedAt).toDateString() === new Date().toDateString()
  );
  const approved = requests.filter((r) => r.status === 'APPROVED');
  const rejected = requests.filter((r) => r.status === 'REJECTED');

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      String(r.cif || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.customerName || '').toLowerCase().includes(search.toLowerCase());
    const canonicalType = TYPE_ALIASES[r.type] || r.type;
    const matchType = typeFilter === 'all' || canonicalType === typeFilter || r.type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleCancel = async (req: PendingRequest) => {
    try {
      const res = await fetch(`/api/approvals/request/${req.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel');
      await loadRequests(typeFilter);
      toast({
        title: 'Request cancelled',
        description: `${getRequestTypeLabel(req.type)} for CIF ${req.cif} has been cancelled.`,
      });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to cancel request' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div>
        <h1 className="relative pl-4 text-2xl font-extrabold tracking-tight text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[hsl(347,80%,50%)] before:to-[hsl(38,92%,55%)] md:text-3xl">
          My Requests (Maker Queue)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage your submitted requests, inspect rejection reasons, or cancel pending items before checker approval.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Pending Requests',
            value: loading ? '—' : pending.length,
            icon: <Clock className="h-5 w-5" />,
            color: '#F59E0B',
            desc: 'Awaiting checker review',
            filterKey: 'PENDING' as const,
          },
          {
            label: 'Submitted Today',
            value: loading ? '—' : today.length,
            icon: <ClipboardList className="h-5 w-5" />,
            color: '#6366F1',
            desc: 'Requests made today',
            filterKey: 'ALL' as const,
          },
          {
            label: 'Approved',
            value: loading ? '—' : approved.length,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: '#10B981',
            desc: 'Completed successfully',
            filterKey: 'APPROVED' as const,
          },
          {
            label: 'Rejected',
            value: loading ? '—' : rejected.length,
            icon: <XCircle className="h-5 w-5" />,
            color: '#F43F5E',
            desc: 'Click to inspect reasons',
            filterKey: 'REJECTED' as const,
          },
        ].map((card) => (
          <button
            type="button"
            key={card.label}
            onClick={() => setStatusFilter(card.filterKey)}
            className={cn(
              'card-3d relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-5 text-left backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
              statusFilter === card.filterKey && card.filterKey !== 'ALL' && 'ring-2 ring-primary'
            )}
          >
            <div
              className=" absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-15 blur-2xl"
              style={{ background: card.color }}
            />
            <div className="mb-3 flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${card.color}22`, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
              {loading ? <Skeleton className="h-8 w-12" /> : card.value}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
          </button>
        ))}
      </div>

      {/* ── Status Filter Pills ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: 'ALL', label: `All (${requests.length})` },
            { key: 'PENDING', label: `Pending (${pending.length})` },
            { key: 'APPROVED', label: `Approved (${approved.length})` },
            { key: 'REJECTED', label: `Rejected (${rejected.length})` },
            {
              key: 'CANCELLED',
              label: `Cancelled (${requests.filter((r) => r.status === 'CANCELLED').length})`,
            },
          ] as const
        ).map((pill) => (
          <Button
            key={pill.key}
            variant={statusFilter === pill.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(pill.key)}
            className={cn(
              'h-8 rounded-xl text-xs font-semibold',
              pill.key === 'REJECTED' &&
                statusFilter === 'REJECTED' &&
                'bg-rose-600 text-white hover:bg-rose-700'
            )}
          >
            {pill.label}
          </Button>
        ))}
      </div>

      {/* ── Requests Table ── */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">My Requests</CardTitle>
              <CardDescription className="text-xs">
                All requests submitted by you — click a Rejected row to view checker remarks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search CIF or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-52 rounded-xl pl-8 text-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-xs">
                    <Filter className="h-3 w-3" />
                    {typeFilter === 'all' ? 'All Types' : getRequestTypeLabel(typeFilter)}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                    <DropdownMenuItem key={k} onClick={() => setTypeFilter(k)}>
                      {v}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => loadRequests(typeFilter)}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    CIF / Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Branch
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Submitted
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No requests found matching your filter criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((req) => {
                    const isRejected = req.status === 'REJECTED';
                    const isExpanded = expandedRowId === req.id;

                    return (
                      <Fragment key={req.id}>
                        <TableRow
                          className={cn(
                            'transition-colors hover:bg-muted/20',
                            isRejected && 'cursor-pointer bg-rose-500/[0.02]'
                          )}
                          onClick={() => {
                            if (isRejected) {
                              setExpandedRowId((prev) => (prev === req.id ? null : req.id));
                            }
                          }}
                        >
                          <TableCell className="py-3 pl-4 text-sm font-medium">
                            {getRequestTypeLabel(req.type)}
                          </TableCell>
                          <TableCell className="py-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{req.cif}</p>
                              {req.customerName && (
                                <p className="text-xs text-muted-foreground">
                                  {req.customerName}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-sm text-muted-foreground">
                            {req.branchCode || '—'}
                          </TableCell>
                          <TableCell className="py-3">
                            <div>
                              <p className="text-sm text-foreground">
                                {new Date(req.submittedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {timeAgo(req.submittedAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={req.status} />
                              {isRejected && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell
                            className="py-3 pr-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {req.status === 'PENDING' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel the{' '}
                                      <strong>{getRequestTypeLabel(req.type)}</strong> request for
                                      CIF <strong>{req.cif}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">
                                      Keep Request
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="rounded-xl bg-destructive hover:bg-destructive/90"
                                      onClick={() => handleCancel(req)}
                                    >
                                      Yes, Cancel
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {isRejected && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-xl border-rose-500/30 text-xs text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                                onClick={() => setRejectionModalItem(req)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Rejection Details
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expandable Rejection Details Row */}
                        {isRejected && isExpanded && (
                          <TableRow className="bg-rose-500/[0.04] hover:bg-rose-500/[0.06]">
                            <TableCell colSpan={6} className="px-6 py-4">
                              <div className="rounded-xl border border-rose-500/30 bg-card p-4 shadow-sm">
                                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                  <AlertOctagon className="h-4 w-4" />
                                  Checker Rejection Audit
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                  <div className="flex items-start gap-2.5">
                                    <UserX className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Rejected By
                                      </p>
                                      <p className="mt-0.5 text-sm font-medium text-foreground">
                                        {req.rejectedBy || 'Checker Admin'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2.5">
                                    <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Rejected At
                                      </p>
                                      <p className="mt-0.5 text-sm font-medium text-foreground">
                                        {req.rejectedAt
                                          ? new Date(req.rejectedAt).toLocaleString()
                                          : new Date(req.submittedAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2.5 sm:col-span-1">
                                    <MessageSquareWarning className="mt-0.5 h-4 w-4 text-rose-500" />
                                    <div>
                                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Rejection Reason
                                      </p>
                                      <p className="mt-0.5 text-sm font-medium text-foreground">
                                        {req.rejectionReason || 'No reason recorded.'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Details Modal */}
      <Dialog
        open={!!rejectionModalItem}
        onOpenChange={(open) => !open && setRejectionModalItem(null)}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="h-5 w-5" />
              Request Rejection Details
            </DialogTitle>
            <DialogDescription>
              {rejectionModalItem &&
                `${getRequestTypeLabel(rejectionModalItem.type)} for CIF ${rejectionModalItem.cif} (${rejectionModalItem.customerName || 'Customer'})`}
            </DialogDescription>
          </DialogHeader>
          {rejectionModalItem && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rejected By (Checker)
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {rejectionModalItem.rejectedBy || 'Checker Admin'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rejected Timestamp
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {rejectionModalItem.rejectedAt
                      ? new Date(rejectionModalItem.rejectedAt).toLocaleString()
                      : new Date(rejectionModalItem.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Mandatory Rejection Reason
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {rejectionModalItem.rejectionReason || 'No rejection reason provided.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
