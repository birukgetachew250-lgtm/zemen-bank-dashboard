"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, XCircle, Ban, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';

interface PendingRequest {
  id: string;
  type: string;
  cif: string;
  customerName?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING:   { label: 'Pending',   className: 'badge-pending' },
    APPROVED:  { label: 'Approved',  className: 'badge-approved' },
    REJECTED:  { label: 'Rejected',  className: 'badge-rejected' },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const cfg = map[status] || { label: status, className: '' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.className)}>
      {cfg.label}
    </span>
  );
}

export function MakerMiniHistory({ approvalType }: { approvalType: string }) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/approvals/request?role=maker&type=${approvalType}`);
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [approvalType]);

  if (!loading && requests.length === 0) {
    return null; // Don't show history if they've never made a request of this type
  }

  const pending = requests.filter(r => r.status === 'PENDING');
  const approved = requests.filter(r => r.status === 'APPROVED');
  const rejected = requests.filter(r => r.status === 'REJECTED');
  const cancelled = requests.filter(r => r.status === 'CANCELLED');

  const MiniTable = ({ data }: { data: PendingRequest[] }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 mt-3">
      <Table className="font-body text-xs">
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="py-2 h-8 uppercase tracking-wider font-semibold">Customer</TableHead>
            <TableHead className="py-2 h-8 uppercase tracking-wider font-semibold">Date</TableHead>
            <TableHead className="py-2 h-8 uppercase tracking-wider font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
             <TableRow>
                <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                <TableCell><Skeleton className="h-3 w-12" /></TableCell>
             </TableRow>
          ) : data.length > 0 ? (
            data.slice(0, 5).map(req => ( // Only show latest 5
              <TableRow key={req.id}>
                <TableCell className="py-2 font-medium">{req.customerName || req.cif}</TableCell>
                <TableCell className="py-2 text-muted-foreground">{format(parseISO(req.submittedAt), 'MMM dd, HH:mm')}</TableCell>
                <TableCell className="py-2"><StatusBadge status={req.status} /></TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="py-4 text-center text-muted-foreground">No recent requests</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="shadow-sm border-slate-200/80 rounded-2xl mb-6 bg-white overflow-hidden">
      <CardHeader className="py-4 px-5 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <History className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Your recent submissions for this task</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="rounded-xl bg-muted/50 mb-1 h-8 w-full justify-start overflow-x-auto flex-nowrap hide-scrollbar">
            <TabsTrigger value="pending" className="rounded-lg text-[11px] gap-1.5 h-6 px-3">
              <Clock className="h-3 w-3" /> Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg text-[11px] gap-1.5 h-6 px-3">
              <CheckCircle2 className="h-3 w-3" /> Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg text-[11px] gap-1.5 h-6 px-3">
              <XCircle className="h-3 w-3" /> Rejected ({rejected.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending"><MiniTable data={pending} /></TabsContent>
          <TabsContent value="approved"><MiniTable data={approved} /></TabsContent>
          <TabsContent value="rejected"><MiniTable data={rejected} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
