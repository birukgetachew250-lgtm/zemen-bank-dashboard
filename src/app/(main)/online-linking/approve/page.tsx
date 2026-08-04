'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Search, RefreshCw, UserCheck, XCircle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  const router = useRouter();
  const [rows, setRows]           = useState<LinkingRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

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
    <div className="w-full h-full p-4 md:p-8 pt-6 space-y-6 bg-muted/5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-500/10 rounded-xl">
               <ShieldCheck className="w-6 h-6 text-emerald-500" />
             </div>
             <h2 className="text-3xl font-bold tracking-tight">Approval Queue</h2>
          </div>
          <p className="text-muted-foreground mt-2">Reviewed requests awaiting final approval &middot; Step 2 of 2</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-background shadow-sm">
            <span className="font-bold mr-1">{total}</span> awaiting approval
          </Badge>
          <Button variant="outline" onClick={() => fetchRows()} className="gap-2 shadow-sm rounded-lg h-10">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="shadow-md border-muted/50 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-muted-foreground max-w-lg">
              <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <CardDescription className="text-sm">
                These requests have been reviewed by a colleague. Approve to execute account linking, or reject with a reason. You cannot approve a request you reviewed yourself.
              </CardDescription>
            </div>
            <div className="relative w-full md:max-w-sm shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, CIF, or phone..."
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
                <TableHead className="font-semibold">Branch</TableHead>
                <TableHead className="font-semibold">Verification</TableHead>
                <TableHead className="font-semibold">Reviewed</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                     <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                      <span>Loading reviewed requests...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No reviewed requests awaiting approval.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const scoreNum = Number(row.SimilarityScore ?? 0);
                  const scorePct = (scoreNum > 1 ? scoreNum : scoreNum * 100).toFixed(1);

                  return (
                    <TableRow key={row.Id} className="group hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => router.push(`/online-linking/${row.Id}?mode=approve`)}>
                      <TableCell className="pl-6 font-medium">{row.FullName}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{row.Cif || '—'}</TableCell>
                      <TableCell>{row.HomeBranch}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          {row.FaydaVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />} Fayda
                          <span className="text-muted-foreground mx-1">|</span>
                          {row.LivenessCheckPassed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />} Live
                          <span className="text-muted-foreground mx-1">|</span>
                          <span className="font-medium">{scorePct}%</span> Match
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.ReviewedAt ? new Date(row.ReviewedAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="default" size="sm" className="shadow-sm bg-emerald-600 hover:bg-emerald-700 transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/online-linking/${row.Id}?mode=approve`); }}>
                          Approve <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
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
