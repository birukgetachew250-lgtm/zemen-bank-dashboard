"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Loader2, Search, Clock, Ban, XCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toTitleCase, cn } from "@/lib/utils";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { type DocumentMeta } from "../ui/DocumentViewer";

interface Approval {
  id: string;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
  details: string;
  documents?: DocumentMeta[];
  attachmentUrl?: string;
  checkerRemarks?: string;
  status?: string;
}

interface ApprovalClientPageProps {
  approvalType: string;
  pageTitle: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING:   { label: 'Pending',   className: 'badge-pending' },
    APPROVED:  { label: 'Approved',  className: 'badge-approved' },
    REJECTED:  { label: 'Rejected',  className: 'badge-rejected' },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  };
  const cfg = map[status?.toUpperCase()] || { label: status, className: '' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cfg.className)}>
      {cfg.label}
    </span>
  );
}

export function ApprovalClientPage({ approvalType, pageTitle }: ApprovalClientPageProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/pending?type=${approvalType}&status=all`);
      const data = await response.json();
      setApprovals(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching approvals",
        description: "Could not load data for approvals.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [approvalType]);


  const pending = approvals.filter(a => !a.status || a.status.toLowerCase() === 'pending');
  const approved = approvals.filter(a => a.status?.toLowerCase() === 'approved');
  const rejected = approvals.filter(a => a.status?.toLowerCase() === 'rejected');
  const cancelled = approvals.filter(a => a.status?.toLowerCase() === 'cancelled');

  const filterList = (list: Approval[]) => {
    if (!searchTerm) return list;
    return list.filter(
      (approval) =>
        approval.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.customerPhone?.includes(searchTerm)
    );
  };

  const RequestsTable = ({ data }: { data: Approval[] }) => {
    const filteredData = filterList(data);
    
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
        <Table className="font-body">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider pl-4">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Phone</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right pr-4"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((approval, i) => (
                <TableRow 
                  key={approval.id} 
                  className="hover:bg-muted/50 cursor-pointer transition-colors" 
                  onClick={() => router.push(`/approvals/${approvalType}/${approval.id}`)}
                >
                  <TableCell className="pl-4 font-medium py-3 text-sm">{toTitleCase(approval.customerName || 'Unknown')}</TableCell>
                  <TableCell className="py-3 text-sm">{approval.customerPhone}</TableCell>
                  <TableCell className="py-3 text-sm">{format(parseISO(approval.requestedAt), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={approval.status || 'PENDING'} />
                  </TableCell>
                  <TableCell className="text-right py-3 pr-4">
                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                      {approval.status && approval.status.toLowerCase() !== 'pending' ? 'View' : 'Review'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review, manage, and track history for these requests.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Approval', value: loading ? '—' : pending.length,   icon: <Clock className="h-5 w-5" />,    color: '#F59E0B', desc: 'Awaiting your review' },
          { label: 'Approved',         value: loading ? '—' : approved.length,  icon: <CheckCircle2 className="h-5 w-5" />, color: '#10B981', desc: 'Successfully processed' },
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

      {/* ── Search & Filter ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search by name or phone..."
            className="pl-8 h-8 text-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tabbed View ── */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="rounded-xl bg-muted/50 mb-4 h-9">
          <TabsTrigger value="pending" className="rounded-lg text-xs gap-1.5 h-7">
            <Clock className="h-3.5 w-3.5" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg text-xs gap-1.5 h-7">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg text-xs gap-1.5 h-7">
            <XCircle className="h-3.5 w-3.5" />
            Rejected ({rejected.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg text-xs gap-1.5 h-7">
            <Ban className="h-3.5 w-3.5" />
            Cancelled ({cancelled.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending"><RequestsTable data={pending} /></TabsContent>
        <TabsContent value="approved"><RequestsTable data={approved} /></TabsContent>
        <TabsContent value="rejected"><RequestsTable data={rejected} /></TabsContent>
        <TabsContent value="cancelled"><RequestsTable data={cancelled} /></TabsContent>
      </Tabs>
    </div>
  );
}
