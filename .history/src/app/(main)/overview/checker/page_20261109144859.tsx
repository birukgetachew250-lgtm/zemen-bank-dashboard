'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  Clock,
  XCircle,
  Ban,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Eye,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentViewer, type DocumentMeta } from '@/components/ui/DocumentViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CheckerRequest {
  id: string;
  type: string;
  cif: string;
  customerName?: string;
  branchCode?: string;
  submittedAt: string;
  resolvedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedBy?: string;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  documents?: DocumentMeta[];
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

function RequestsTable({
  data,
  loading,
  typeFilter,
  onTypeFilterChange,
}: {
  data: CheckerRequest[];
  loading: boolean;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
}) {
  const [selected, setSelected] = useState<CheckerRequest | null>(null);
  const [search, setSearch] = useState('');

  const filtered = data.filter((r) => {
    const matchSearch =
      !search ||
      String(r.cif || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.customerName || '').toLowerCase().includes(search.toLowerCase());
    const canonical = TYPE_ALIASES[r.type] || r.type;
    const matchType =
      typeFilter === 'all' || canonical === typeFilter || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 max-w-72 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search CIF or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-xl pl-8 text-sm"
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
          <DropdownMenuContent align="start" className="rounded-xl">
            <DropdownMenuItem onClick={() => onTypeFilterChange('all')}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
              <DropdownMenuItem key={k} onClick={() => onTypeFilterChange(k)}>
                {v}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/80">
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
                Submitted By
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Status / Audit
              </TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => (
                <TableRow key={req.id} className="transition-colors hover:bg-muted/20">
                  <TableCell className="py-3 pl-4 text-sm font-medium">
                    {getRequestTypeLabel(req.type)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{req.cif}</p>
                      {req.customerName && (
                        <p className="text-xs text-muted-foreground">{req.customerName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {req.branchCode || '—'}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground">
                    {req.submittedBy || '—'}
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
                    <div className="space-y-1">
                      <StatusBadge status={req.status} />
                      {req.status === 'REJECTED' && (
                        <div className="text-[11px] text-muted-foreground">
                          {req.rejectedBy && <p>By: {req.rejectedBy}</p>}
                          {req.rejectionReason && (
                            <p
                              className="max-w-48 truncate font-medium text-rose-600 dark:text-rose-400"
                              title={req.rejectionReason}
                            >
                              Reason: {req.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 pr-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {req.documents && req.documents.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-xl text-xs"
                          onClick={() => setSelected(req)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {req.documents.length} doc{req.documents.length > 1 ? 's' : ''}
                        </Button>
                      )}
                      {req.status === 'PENDING' && (
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1 rounded-xl text-xs">
                          <Link href={`/approvals/${req.id}`}>
                            Review
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Document Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Documents — {selected && getRequestTypeLabel(selected.type)} for CIF{' '}
              {selected?.cif}
            </DialogTitle>
          </DialogHeader>
          {selected?.documents && <DocumentViewer documents={selected.documents} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CheckerDashboardPage() {
  const [requests, setRequests] = useState<CheckerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  const loadRequests = useCallback(async (selectedType = typeFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'checker' });
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
      console.error('Failed to load checker requests');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    loadRequests(typeFilter);
  }, [typeFilter, loadRequests]);

  const pending = requests.filter((r) => r.status === 'PENDING');
  const approved = requests.filter((r) => r.status === 'APPROVED');
  const rejected = requests.filter((r) => r.status === 'REJECTED');
  const cancelled = requests.filter((r) => r.status === 'CANCELLED');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div>
        <h1 className="relative pl-4 text-2xl font-extrabold tracking-tight text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[hsl(347,80%,50%)] before:to-[hsl(38,92%,55%)] md:text-3xl">
          Pending Approvals (Checker Queue)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and action Maker requests, inspect supporting KYC documents, and audit approval history.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Pending Approval',
            value: loading ? '—' : pending.length,
            icon: <Clock className="h-5 w-5" />,
            color: '#F59E0B',
            desc: 'Requires your action',
          },
          {
            label: 'Approved',
            value: loading ? '—' : approved.length,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: '#10B981',
            desc: 'Approved requests',
          },
          {
            label: 'Rejected',
            value: loading ? '—' : rejected.length,
            icon: <XCircle className="h-5 w-5" />,
            color: '#EF4444',
            desc: 'Declined by checker',
          },
          {
            label: 'Cancelled by Maker',
            value: loading ? '—' : cancelled.length,
            icon: <Ban className="h-5 w-5" />,
            color: '#6B7280',
            desc: 'Withdrawn before review',
          },
        ].map((card) => (
          <div
            key={card.label}
            data-reveal
            className="card-3d relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-5 backdrop-blur transition-shadow duration-300 hover:shadow-lg"
          >
            <div
              className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-15 blur-2xl"
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
          </div>
        ))}
      </div>

      {/* ── Tabbed Request Tables ── */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Approval Requests</CardTitle>
              <CardDescription className="text-xs">
                Filter by status, request type, CIF, or customer name
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => loadRequests(typeFilter)}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4 rounded-xl">
              <TabsTrigger value="pending" className="gap-1.5 rounded-lg text-xs">
                <Clock className="h-3.5 w-3.5" />
                Pending ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-1.5 rounded-lg text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved ({approved.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-1.5 rounded-lg text-xs">
                <XCircle className="h-3.5 w-3.5" />
                Rejected ({rejected.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-1.5 rounded-lg text-xs">
                <Ban className="h-3.5 w-3.5" />
                Cancelled ({cancelled.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <RequestsTable
                data={pending}
                loading={loading}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </TabsContent>
            <TabsContent value="approved">
              <RequestsTable
                data={approved}
                loading={loading}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </TabsContent>
            <TabsContent value="rejected">
              <RequestsTable
                data={rejected}
                loading={loading}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </TabsContent>
            <TabsContent value="cancelled">
              <RequestsTable
                data={cancelled}
                loading={loading}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
