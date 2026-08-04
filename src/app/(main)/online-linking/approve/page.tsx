'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Search, RefreshCw, ShieldCheck, XCircle, UserCheck,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LinkingDetailModal from '@/components/online-linking/LinkingDetailModal';

interface LinkingRow {
  Id: string;
  Cif: string;
  FullName: string;
  Phone: string;
  HomeBranch: string;
  AccountNumber: string;
  AccountType: string;
  FaydaVerified: number;
  LivenessCheckPassed: number;
  SimilarityScore: number;
  Status: string;
  SubmittedAt: string;
  ReviewedAt: string;
}

export default function OnlineLinkingApprovePage() {
  const [rows, setRows]           = useState<LinkingRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const limit = 15;

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: 'Reviewed',
      });
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
  }, [page, search]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="w-full h-full p-4 md:p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Approval Queue</h2>
          <p className="text-muted-foreground mt-1">Reviewed requests awaiting final approval &middot; Step 2 of 2</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {total} awaiting approval
          </Badge>
          <Button variant="outline" onClick={() => fetchRows()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <CardDescription className="text-sm">
              These requests have been reviewed by a colleague. Approve to execute account linking, or reject with a reason. You cannot approve a request you reviewed yourself.
            </CardDescription>
          </div>
          <div className="pt-4 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, CIF, or phone..."
              className="pl-8"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>CIF</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Reviewed</TableHead>
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
                    No reviewed requests awaiting approval.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const scoreNum = Number(row.SimilarityScore ?? 0);
                  const scorePct = (scoreNum > 1 ? scoreNum : scoreNum * 100).toFixed(1);

                  return (
                    <TableRow key={row.Id}>
                      <TableCell className="font-medium">{row.FullName}</TableCell>
                      <TableCell>{row.Cif}</TableCell>
                      <TableCell>{row.HomeBranch}</TableCell>
                      <TableCell>{row.AccountNumber || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          {row.FaydaVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />} Fayda
                          <span className="text-muted-foreground mx-1">|</span>
                          {row.LivenessCheckPassed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />} Live
                          <span className="text-muted-foreground mx-1">|</span>
                          <span className="font-medium">{scorePct}%</span> Match
                        </div>
                      </TableCell>
                      <TableCell>{row.ReviewedAt ? new Date(row.ReviewedAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="default" size="sm" onClick={() => { setSelectedId(row.Id); setModalOpen(true); }}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
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
        mode="approve"
        onActionComplete={() => fetchRows()}
      />
    </div>
  );
}
