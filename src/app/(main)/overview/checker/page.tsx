
'use client';

import { useState, useEffect } from 'react';
import { FileCheck2, Clock, XCircle, Ban, Search, Filter, ChevronDown, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { DocumentViewer, type DocumentMeta } from '@/components/ui/DocumentViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  rejectionReason?: string;
  documents?: DocumentMeta[];
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  'new-customer': 'Create Customer',
  'update-customer': 'Update Customer',
  'link-account': 'Link Account',
  'unlink-account': 'Unlink Account',
  'suspend-customer': 'Suspend Customer',
  'unsuspend-customer': 'Unsuspend Customer',
  'unlock-customer': 'Unlock Customer',
  'resend-activation': 'Send Activation',
  'pin-reset': 'PIN Reset',
  'security-reset': 'Security Reset',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING:   { label: 'Pending',   className: 'badge-pending' },
    APPROVED:  { label: 'Approved',  className: 'badge-approved' },
    REJECTED:  { label: 'Rejected',  className: 'badge-rejected' },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const cfg = map[status] || { label: status, className: '' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.className)}>
      {cfg.label}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}



function RequestsTable({ data, loading }: { data: CheckerRequest[]; loading: boolean }) {
  const [selected, setSelected] = useState<CheckerRequest | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = data.filter(r => {
    const matchSearch =
      !search ||
      r.cif.includes(search) ||
      (r.customerName || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search CIF or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm rounded-xl"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl h-8 gap-1.5 text-xs">
              <Filter className="h-3 w-3" />
              {typeFilter === 'all' ? 'All Types' : REQUEST_TYPE_LABELS[typeFilter] || typeFilter}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl">
            <DropdownMenuItem onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
              <DropdownMenuItem key={k} onClick={() => setTypeFilter(k)}>{v}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider pl-4">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">CIF / Customer</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Branch</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Submitted By</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right pr-4">Docs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(req => (
                <TableRow key={req.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-4 font-medium text-sm py-3">
                    {REQUEST_TYPE_LABELS[req.type] || req.type}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-semibold">{req.cif}</p>
                      {req.customerName && <p className="text-xs text-muted-foreground">{req.customerName}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{req.branchCode || '—'}</TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground">{req.submittedBy || '—'}</TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm">{new Date(req.submittedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(req.submittedAt)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <StatusBadge status={req.status} />
                      {req.rejectionReason && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-24" title={req.rejectionReason}>
                          {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right pr-4">
                    {req.documents && req.documents.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl text-xs gap-1.5"
                        onClick={() => setSelected(req)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {req.documents.length} doc{req.documents.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Document Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Documents — {selected && (REQUEST_TYPE_LABELS[selected.type] || selected.type)} for CIF {selected?.cif}
            </DialogTitle>
          </DialogHeader>
          {selected?.documents && (
            <DocumentViewer documents={selected.documents} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CheckerDashboardPage() {
  const [requests, setRequests] = useState<CheckerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/approvals/request?role=checker', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(data);
    } catch {
      console.error('Failed to load checker requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending   = requests.filter(r => r.status === 'PENDING');
  const rejected  = requests.filter(r => r.status === 'REJECTED');
  const cancelled = requests.filter(r => r.status === 'CANCELLED');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Checker Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor all request activity — view, track, and review documents across all statuses.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Approval', value: loading ? '—' : pending.length,   icon: <Clock className="h-5 w-5" />,    color: '#F59E0B', desc: 'Awaiting your review' },
          { label: 'Cancelled',        value: loading ? '—' : cancelled.length, icon: <Ban className="h-5 w-5" />,      color: '#94A3B8', desc: 'Cancelled by makers' },
          { label: 'Rejected',         value: loading ? '—' : rejected.length,  icon: <XCircle className="h-5 w-5" />,  color: '#EF4444', desc: 'Requests rejected' },
        ].map(card => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ boxShadow: '0 2px 8px rgba(34,47,90,0.06)' }}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 blur-2xl" style={{ background: card.color }} />
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}22`, color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {loading ? <Skeleton className="h-8 w-12" /> : card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Tabbed Request Views ── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Requests</CardTitle>
          <CardDescription className="text-xs">Filtered view across all statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="rounded-xl bg-muted/50 mb-4">
              <TabsTrigger value="pending" className="rounded-lg text-xs gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Pending ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg text-xs gap-1.5">
                <Ban className="h-3.5 w-3.5" />
                Cancelled ({cancelled.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-lg text-xs gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Rejected ({rejected.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <RequestsTable data={pending} loading={loading} />
            </TabsContent>
            <TabsContent value="cancelled">
              <RequestsTable data={cancelled} loading={loading} />
            </TabsContent>
            <TabsContent value="rejected">
              <RequestsTable data={rejected} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
