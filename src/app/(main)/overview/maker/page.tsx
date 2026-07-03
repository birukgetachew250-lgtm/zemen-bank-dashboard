
'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle2, XCircle, Trash2, RefreshCw, Search, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  'new-customer': 'Create Customer',
  'update-customer': 'Update Customer',
  'link-account': 'Link Account',
  'unlink-account': 'Unlink Account',
  'suspend-customer': 'Suspend Customer',
  'unsuspend-customer': 'Unsuspend Customer',
  'unlock-customer': 'Unlock Customer',
  'resend-activation': 'Resend Activation',
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

/* ── Mock data (replace with real API call) ── */
const MOCK_REQUESTS: PendingRequest[] = [
  { id: '1', type: 'new-customer',     cif: '1001234', customerName: 'Abebe Bekele',   branchCode: '302', submittedAt: new Date(Date.now() - 3600000).toISOString(),  status: 'PENDING',   submittedBy: 'maker@zemen.com' },
  { id: '2', type: 'pin-reset',         cif: '1005678', customerName: 'Tigist Alemu',  branchCode: '302', submittedAt: new Date(Date.now() - 7200000).toISOString(),  status: 'PENDING',   submittedBy: 'maker@zemen.com' },
  { id: '3', type: 'link-account',      cif: '1009012', customerName: 'Dawit Haile',   branchCode: '305', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'APPROVED',  submittedBy: 'maker@zemen.com' },
  { id: '4', type: 'suspend-customer',  cif: '1003456', customerName: 'Sara Tesfaye',  branchCode: '301', submittedAt: new Date(Date.now() - 172800000).toISOString(),status: 'PENDING',   submittedBy: 'maker@zemen.com' },
  { id: '5', type: 'unlock-customer',   cif: '1007890', customerName: 'Yonas Girma',   branchCode: '302', submittedAt: new Date(Date.now() - 3000000).toISOString(),  status: 'PENDING',   submittedBy: 'maker@zemen.com' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
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
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setRequests(MOCK_REQUESTS);
      setLoading(false);
    }, 800);
  }, []);

  const pending   = requests.filter(r => r.status === 'PENDING');
  const today     = requests.filter(r => new Date(r.submittedAt).toDateString() === new Date().toDateString());
  const approved  = requests.filter(r => r.status === 'APPROVED');

  const filtered = requests.filter(r => {
    const matchSearch =
      !search ||
      r.cif.includes(search) ||
      (r.customerName || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleCancel = async (req: PendingRequest) => {
    try {
      // TODO: call DELETE /api/requests/:id
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'CANCELLED' } : r));
      toast({ title: 'Request cancelled', description: `${REQUEST_TYPE_LABELS[req.type] || req.type} for CIF ${req.cif} has been cancelled.` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to cancel request' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Maker Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage your submitted requests. Cancel pending items before checker approval.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Pending Requests',
            value: loading ? '—' : pending.length,
            icon: <Clock className="h-5 w-5" />,
            color: '#F59E0B',
            desc: 'Awaiting checker review',
          },
          {
            label: 'Submitted Today',
            value: loading ? '—' : today.length,
            icon: <ClipboardList className="h-5 w-5" />,
            color: '#6366F1',
            desc: 'Requests made today',
          },
          {
            label: 'Approved',
            value: loading ? '—' : approved.length,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: '#10B981',
            desc: 'Completed successfully',
          },
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

      {/* ── Requests Table ── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-semibold">My Requests</CardTitle>
              <CardDescription className="text-xs">All requests submitted by you</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search CIF or name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm w-52 rounded-xl"
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
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                    <DropdownMenuItem key={k} onClick={() => setTypeFilter(k)}>{v}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider pl-4">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">CIF / Customer</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Branch</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Submitted</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
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
                      <TableCell className="py-3">
                        <div>
                          <p className="text-sm">{new Date(req.submittedAt).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(req.submittedAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3"><StatusBadge status={req.status} /></TableCell>
                      <TableCell className="py-3 text-right pr-4">
                        {req.status === 'PENDING' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-xl text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will cancel the <strong>{REQUEST_TYPE_LABELS[req.type]}</strong> request for CIF <strong>{req.cif}</strong>. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Keep Request</AlertDialogCancel>
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
