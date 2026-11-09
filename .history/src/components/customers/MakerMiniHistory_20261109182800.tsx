'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  History,
  Trash2,
  RefreshCw,
  Archive,
  MessageSquareWarning,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PendingRequest {
  id: string;
  type: string;
  cif: string;
  customerName?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
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
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  );
}

export function MakerMiniHistory({ approvalType }: { approvalType: string }) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/approvals/request?role=maker&type=${encodeURIComponent(approvalType)}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [approvalType]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCancelRequest = async (req: PendingRequest) => {
    setCancellingId(req.id);
    try {
      const res = await fetch(`/api/approvals/request/${req.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel request');
      }
      toast({
        title: 'Request Cancelled',
        description: `Pending request for ${
          req.customerName || `CIF ${req.cif}`
        } has been cancelled.`,
      });
      await loadRequests();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Cancel Failed',
        description: err.message,
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (!loading && requests.length === 0) {
    return null;
  }

  const pending = requests.filter((r) => r.status === 'PENDING');
  const approved = requests.filter((r) => r.status === 'APPROVED');
  const rejected = requests.filter((r) => r.status === 'REJECTED');
  const cancelled = requests.filter((r) => r.status === 'CANCELLED');

  const MiniTable = ({
    data,
    showRejection,
    showCancel,
  }: {
    data: PendingRequest[];
    showRejection?: boolean;
    showCancel?: boolean;
  }) => (
    <div className="mt-3 overflow-x-auto rounded-xl border border-border/80">
      <Table className="font-body text-xs">
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="h-8 py-2 font-semibold uppercase tracking-wider">
              Customer / CIF
            </TableHead>
            <TableHead className="h-8 py-2 font-semibold uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="h-8 py-2 font-semibold uppercase tracking-wider">
              Status
            </TableHead>
            {showRejection && (
              <TableHead className="h-8 py-2 font-semibold uppercase tracking-wider">
                Checker Rejection Reason
              </TableHead>
            )}
            {showCancel && (
              <TableHead className="h-8 py-2 text-right font-semibold uppercase tracking-wider">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell>
                <Skeleton className="h-3 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-12" />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.slice(0, 6).map((req) => (
              <TableRow key={req.id}>
                <TableCell className="py-2 font-medium text-foreground">
                  <div>
                    <p className="font-semibold">{req.customerName || req.cif}</p>
                    {req.customerName && req.cif && (
                      <p className="font-mono text-[10px] text-muted-foreground">
                        CIF: {req.cif}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2 text-muted-foreground">
                  {format(parseISO(req.submittedAt), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell className="py-2">
                  <StatusBadge status={req.status} />
                </TableCell>
                {showRejection && (
                  <TableCell className="py-2">
                    <div className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400">
                      <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div>
                        <p className="font-medium">
                          {req.rejectionReason || 'Rejected by Checker'}
                        </p>
                        {req.rejectedBy && (
                          <p className="text-[10px] text-muted-foreground">
                            By: {req.rejectedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                )}
                {showCancel && (
                  <TableCell className="py-2 text-right">
                    {req.status === 'PENDING' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancellingId === req.id}
                            className="h-7 rounded-lg border-rose-500/30 px-2.5 text-[11px] text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Cancel Request
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Pending Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this pending request for{' '}
                              <strong>{req.customerName || `CIF ${req.cif}`}</strong>? Once
                              cancelled, it will be removed from the Checker approval queue.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">
                              Keep Request
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelRequest(req)}
                              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Cancel Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={showRejection || showCancel ? 4 : 3}
                className="py-4 text-center text-muted-foreground"
              >
                No requests in this status
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <History className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Your Recent Submissions (Active 7-Day Window)
            </CardTitle>
            <CardDescription className="text-xs">
              Cancel pending requests before Checker review or inspect rejected items
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg text-[11px] gap-1"
          >
            <Link href="/overview/archive">
              <Archive className="h-3 w-3" />
              Search Older (&gt;7d)
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadRequests}
            className="h-7 w-7 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="hide-scrollbar mb-1 flex h-8 w-full flex-nowrap justify-start overflow-x-auto rounded-xl bg-muted/50">
            <TabsTrigger value="pending" className="h-6 gap-1.5 rounded-lg px-3 text-[11px]">
              <Clock className="h-3 w-3" /> Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="h-6 gap-1.5 rounded-lg px-3 text-[11px]">
              <XCircle className="h-3 w-3 text-rose-500" /> Rejected ({rejected.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="h-6 gap-1.5 rounded-lg px-3 text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="h-6 gap-1.5 rounded-lg px-3 text-[11px]">
              <Ban className="h-3 w-3" /> Cancelled ({cancelled.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <MiniTable data={pending} showCancel />
          </TabsContent>
          <TabsContent value="rejected">
            <MiniTable data={rejected} showRejection />
          </TabsContent>
          <TabsContent value="approved">
            <MiniTable data={approved} />
          </TabsContent>
          <TabsContent value="cancelled">
            <MiniTable data={cancelled} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
