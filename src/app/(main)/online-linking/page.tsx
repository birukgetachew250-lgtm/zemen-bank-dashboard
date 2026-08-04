'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ScanFace, Clock, CheckCircle2, XCircle, Eye,
  Search, RefreshCw, Users, ShieldCheck, AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Stats {
  total: number;
  Pending: number;
  Reviewed: number;
  Approved: number;
  Rejected: number;
}

interface LinkingRow {
  Id: string;
  Cif: string;
  FullName: string;
  Phone: string;
  HomeBranch: string;
  AccountNumber: string;
  Status: string;
  SubmittedAt: string;
  FaydaVerified: number;
  LivenessCheckPassed: number;
}

const STATUS_TABS = ['All', 'Pending', 'Reviewed', 'Approved', 'Rejected'] as const;

export default function OnlineLinkingOverviewPage() {
  const router = useRouter();
  const [stats, setStats]         = useState<Stats | null>(null);
  const [rows, setRows]           = useState<LinkingRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  const limit = 15;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/online-linking/stats');
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/online-linking?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.data || []);
        setTotal(data.total || 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchRows(); }, [fetchRows]);

  const refresh = () => { fetchStats(); fetchRows(); };
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="w-full h-full space-y-6 p-4 md:p-8 pt-6 bg-muted/5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <ScanFace className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Online Linking</h2>
          </div>
          <p className="text-muted-foreground mt-2">Comprehensive overview of digital self-onboarding requests.</p>
        </div>
        <Button variant="outline" onClick={refresh} className="gap-2 shadow-sm rounded-lg h-10">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stat Cards - Premium Grid Layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Requests', icon: Users, val: stats?.total ?? 0, color: 'text-muted-foreground' },
          { label: 'Pending', icon: Clock, val: stats?.Pending ?? 0, color: 'text-amber-500' },
          { label: 'Reviewed', icon: ShieldCheck, val: stats?.Reviewed ?? 0, color: 'text-sky-500' },
          { label: 'Approved', icon: CheckCircle2, val: stats?.Approved ?? 0, color: 'text-emerald-500' },
          { label: 'Rejected', icon: AlertTriangle, val: stats?.Rejected ?? 0, color: 'text-red-500' },
        ].map((s, i) => (
          <Card key={i} className="shadow-sm border-muted/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <div className="text-3xl font-bold">{s.val}</div>
              </div>
              <div className={`p-3 bg-muted/30 rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="shadow-md border-muted/50 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab}
                  variant={(tab === 'All' && !statusFilter) || tab === statusFilter ? "default" : "outline"}
                  onClick={() => { setStatusFilter(tab === 'All' ? '' : tab); setPage(1); }}
                  size="sm"
                  className="rounded-full shadow-sm"
                >
                  {tab}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-9 bg-background shadow-sm rounded-full"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-semibold">Name</TableHead>
                <TableHead className="font-semibold">CIF</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Branch</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Submitted</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading requests...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No requests found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.Id} className="group hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => router.push(`/online-linking/${row.Id}?mode=view`)}>
                    <TableCell className="pl-6 font-medium">{row.FullName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{row.Cif || '—'}</TableCell>
                    <TableCell>{row.Phone}</TableCell>
                    <TableCell>{row.HomeBranch}</TableCell>
                    <TableCell>
                      <Badge variant={row.Status === 'Approved' ? 'default' : row.Status === 'Rejected' ? 'destructive' : row.Status === 'Reviewed' ? 'secondary' : 'outline'} className="shadow-sm">
                        {row.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.SubmittedAt ? new Date(row.SubmittedAt).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); router.push(`/online-linking/${row.Id}?mode=view`); }}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(page - 1) * limit + (rows.length > 0 ? 1 : 0)}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="shadow-sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="shadow-sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
