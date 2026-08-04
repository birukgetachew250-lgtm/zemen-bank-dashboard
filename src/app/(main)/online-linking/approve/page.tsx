'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Eye, Search, RefreshCw, ChevronLeft, ChevronRight,
  ScanFace, ShieldCheck, XCircle, UserCheck,
} from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-white/10 flex items-center justify-center">
            <ShieldCheck size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Approval Queue
            </h1>
            <p className="text-sm text-white/40">
              Reviewed requests awaiting final approval · Step 2 of 2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/20">
            {total} awaiting approval
          </span>
          <button
            onClick={() => fetchRows()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 border border-emerald-500/10 rounded-xl px-5 py-3 flex items-center gap-3">
        <UserCheck size={18} className="text-emerald-400 shrink-0" />
        <p className="text-sm text-white/50">
          These requests have been reviewed by a colleague. Approve to execute account linking, or reject with a reason.
          <span className="text-emerald-400"> You cannot approve a request you reviewed yourself.</span>
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, CIF, or phone…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'CIF', 'Phone', 'Branch', 'Account', 'Type', 'Fayda', 'Score', 'Reviewed At', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-white/30 uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-white/30">
                      <CheckCircle2 size={40} className="opacity-30" />
                      <p className="text-sm">No reviewed requests awaiting approval</p>
                      <p className="text-xs text-white/20">Requests need to be reviewed first before appearing here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const scoreNum = Number(row.SimilarityScore ?? 0);
                  const scorePct = (scoreNum > 1 ? scoreNum : scoreNum * 100).toFixed(1);
                  const scoreColor = Number(scorePct) >= 80 ? 'text-emerald-400' : Number(scorePct) >= 60 ? 'text-amber-400' : 'text-red-400';

                  return (
                    <tr
                      key={row.Id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5 text-sm text-white/80 font-medium">{row.FullName}</td>
                      <td className="px-4 py-3.5 text-sm text-white/50 font-mono">{row.Cif}</td>
                      <td className="px-4 py-3.5 text-sm text-white/50">{row.Phone}</td>
                      <td className="px-4 py-3.5 text-sm text-white/50">{row.HomeBranch}</td>
                      <td className="px-4 py-3.5 text-sm text-white/50 font-mono">{row.AccountNumber || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-white/50">{row.AccountType || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs ${row.FaydaVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                          {row.FaydaVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-medium tabular-nums ${scoreColor}`} style={{ fontFamily: 'var(--font-outfit)' }}>
                          {scorePct}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white/30">
                        {row.ReviewedAt ? new Date(row.ReviewedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => { setSelectedId(row.Id); setModalOpen(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
                        >
                          <ShieldCheck size={12} />
                          Approve
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/30">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-white/40 px-3">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
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
