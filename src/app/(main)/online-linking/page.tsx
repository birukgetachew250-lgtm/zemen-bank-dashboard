'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScanFace, Clock, CheckCircle2, XCircle, Eye,
  Search, RefreshCw, Users, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LinkingDetailModal from '@/components/online-linking/LinkingDetailModal';

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
  const [stats, setStats]         = useState<Stats | null>(null);
  const [rows, setRows]           = useState<LinkingRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');

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
    <div className="w-full h-full space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ScanFace className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Online Linking</h2>
        </div>
        <Button variant="outline" onClick={refresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <p className="text-muted-foreground">Digital self-onboarding requests overview</p>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.Pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <ShieldCheck className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.Reviewed ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.Approved ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.Rejected ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab}
                  variant={(tab === 'All' && !statusFilter) || tab === statusFilter ? "default" : "outline"}
                  onClick={() => { setStatusFilter(tab === 'All' ? '' : tab); setPage(1); }}
                  size="sm"
                >
                  {tab}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>CIF</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No requests found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.Id}>
                    <TableCell className="font-medium">{row.FullName}</TableCell>
                    <TableCell>{row.Cif}</TableCell>
                    <TableCell>{row.Phone}</TableCell>
                    <TableCell>{row.HomeBranch}</TableCell>
                    <TableCell>
                      <Badge variant={row.Status === 'Approved' ? 'default' : row.Status === 'Rejected' ? 'destructive' : 'secondary'}>
                        {row.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.SubmittedAt ? new Date(row.SubmittedAt).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedId(row.Id); setModalOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LinkingDetailModal
        requestId={selectedId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="view"
      />
    </div>
  );
}
