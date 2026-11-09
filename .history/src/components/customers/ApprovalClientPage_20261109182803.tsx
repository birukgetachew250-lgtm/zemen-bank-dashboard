'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import {
  Search,
  Clock,
  Ban,
  XCircle,
  CheckCircle2,
  Archive,
  RefreshCw,
  MessageSquareWarning,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toTitleCase, cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type DocumentMeta } from '../ui/DocumentViewer';

interface Approval {
  id: string;
  cif?: string | null;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
  details: string;
  documents?: DocumentMeta[];
  attachmentUrl?: string;
  checkerRemarks?: string;
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  status?: string;
}

interface ApprovalClientPageProps {
  approvalType: string;
  pageTitle: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'badge-pending' },
    APPROVED: { label: 'Approved', className: 'badge-approved' },
    REJECTED: { label: 'Rejected', className: 'badge-rejected' },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const cfg = map[status?.toUpperCase()] || { label: status, className: '' };
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

export function ApprovalClientPage({
  approvalType,
  pageTitle,
}: ApprovalClientPageProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/customers/pending?type=${encodeURIComponent(approvalType)}&status=all`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      setApprovals(Array.isArray(data) ? data : []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error fetching approvals',
        description: 'Could not load data for approvals.',
      });
    } finally {
      setLoading(false);
    }
  }, [approvalType, toast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const pending = approvals.filter(
    (a) => !a.status || a.status.toLowerCase() === 'pending'
  );
  const approved = approvals.filter((a) => a.status?.toLowerCase() === 'approved');
  const rejected = approvals.filter((a) => a.status?.toLowerCase() === 'rejected');
  const cancelled = approvals.filter((a) => a.status?.toLowerCase() === 'cancelled');

  const filterList = (list: Approval[]) => {
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (approval) =>
        approval.customerName?.toLowerCase().includes(q) ||
        approval.customerPhone?.toLowerCase().includes(q) ||
        String(approval.cif || '').toLowerCase().includes(q)
    );
  };

  const RequestsTable = ({
    data,
    showRejectionReason,
  }: {
    data: Approval[];
    showRejectionReason?: boolean;
  }) => {
    const filteredData = filterList(data);

    return (
      <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
        <Table className="font-body">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wider">
                Customer Name / CIF
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Phone
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Submitted Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              {showRejectionReason && (
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Checker Rejection Reason
                </TableHead>
              )}
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((approval) => (
                <TableRow
                  key={approval.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() =>
                    router.push(`/approvals/${approvalType}/${approval.id}`)
                  }
                >
                  <TableCell className="py-3 pl-4 text-sm font-medium text-foreground">
                    <div>
                      <p className="font-semibold">
                        {toTitleCase(approval.customerName || 'Unknown')}
                      </p>
                      {approval.cif && (
                        <p className="font-mono text-xs text-muted-foreground">
                          CIF: {approval.cif}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-foreground">
                    {approval.customerPhone}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {format(parseISO(approval.requestedAt), 'dd MMM yyyy, HH:mm')}
                  </TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={approval.status || 'PENDING'} />
                  </TableCell>
                  {showRejectionReason && (
                    <TableCell className="py-3">
                      <div className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                        <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <div>
                          <p className="font-medium">
                            {approval.rejectionReason ||
                              approval.checkerRemarks ||
                              'Rejected by Checker'}
                          </p>
                          {approval.rejectedBy && (
                            <p className="text-[10px] text-muted-foreground">
                              By: {approval.rejectedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="py-3 pr-4 text-right">
                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                      {approval.status && approval.status.toLowerCase() !== 'pending'
                        ? 'View Details'
                        : 'Review Request'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showRejectionReason ? 6 : 5}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No requests found in this status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="relative pl-4 text-2xl font-extrabold tracking-tight text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[hsl(347,80%,50%)] before:to-[hsl(38,92%,55%)] md:text-3xl">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing active unapproved requests from the last 7 days, plus full Approved,
            Rejected, and Cancelled history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
            <Link href="/overview/archive">
              <Archive className="h-3.5 w-3.5 text-amber-500" />
              Search Old Requests (&gt;7 Days)
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApprovals}
            disabled={loading}
            className="rounded-xl gap-1.5 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Pending Approval (Last 7 Days)',
            value: loading ? '—' : pending.length,
            icon: <Clock className="h-5 w-5" />,
            color: '#F59E0B',
            desc: 'Awaiting your review',
          },
          {
            label: 'Approved',
            value: loading ? '—' : approved.length,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: '#10B981',
            desc: 'Successfully processed',
          },
          {
            label: 'Rejected',
            value: loading ? '—' : rejected.length,
            icon: <XCircle className="h-5 w-5" />,
            color: '#EF4444',
            desc: 'Requests rejected with reason',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="card-3d relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-5 backdrop-blur transition-shadow duration-300 hover:shadow-lg"
          >
            <div
              className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl"
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

      {/* ── Search & Filter ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 max-w-72 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, CIF, or phone..."
            className="h-8 rounded-xl pl-8 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tabbed View ── */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4 h-9 rounded-xl bg-muted/50">
          <TabsTrigger value="pending" className="h-7 gap-1.5 rounded-lg text-xs">
            <Clock className="h-3.5 w-3.5" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="h-7 gap-1.5 rounded-lg text-xs">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            Rejected ({rejected.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="h-7 gap-1.5 rounded-lg text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="h-7 gap-1.5 rounded-lg text-xs">
            <Ban className="h-3.5 w-3.5" />
            Cancelled ({cancelled.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <RequestsTable data={pending} />
        </TabsContent>
        <TabsContent value="rejected">
          <RequestsTable data={rejected} showRejectionReason />
        </TabsContent>
        <TabsContent value="approved">
          <RequestsTable data={approved} />
        </TabsContent>
        <TabsContent value="cancelled">
          <RequestsTable data={cancelled} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
