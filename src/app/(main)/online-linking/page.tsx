'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScanFace, Clock, CheckCircle2, XCircle, Eye,
  Search, ChevronLeft, ChevronRight, RefreshCw,
  Users, ShieldCheck, AlertTriangle,
} from 'lucide-react';
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

const statusStyles: Record<string, string> = {
  Pending:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Reviewed: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
};

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

  const statCards = [
    { label: 'Total Requests', value: stats?.total ?? 0,    icon: Users,          gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending',        value: stats?.Pending ?? 0,  icon: Clock,          gradient: 'from-amber-500 to-orange-600' },
    { label: 'Reviewed',       value: stats?.Reviewed ?? 0, icon: ShieldCheck,    gradient: 'from-sky-500 to-blue-600' },
    { label: 'Approved',       value: stats?.Approved ?? 0, icon: CheckCircle2,   gradient: 'from-emerald-500 to-green-600' },
    { label: 'Rejected',       value: stats?.Rejected ?? 0, icon: AlertTriangle,  gradient: 'from-red-500 to-rose-600' },
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
            <ScanFace size={24} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Online Linking
            </h1>
            <p className="text-sm text-white/40">Digital self-onboarding requests overview</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 overflow-hidden group hover:border-white/10 transition-all"
          >
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <card.icon size={16} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
                {card.value}
              </p>
              <p className="text-xs text-white/40 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab === 'All' ? '' : tab); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                (tab === 'All' && !statusFilter) || tab === statusFilter
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, CIF, or phone…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'CIF', 'Phone', 'Branch', 'Account', 'Fayda', 'Liveness', 'Status', 'Submitted', ''].map((h) => (
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
                    <div className="w-6 h-6 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-white/30 text-sm">
                    No requests found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.Id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => { setSelectedId(row.Id); setModalOpen(true); }}
                  >
                    <td className="px-4 py-3.5 text-sm text-white/80 font-medium">{row.FullName}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50 font-mono">{row.Cif}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50">{row.Phone}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50">{row.HomeBranch}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50 font-mono">{row.AccountNumber || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${row.FaydaVerified ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${row.LivenessCheckPassed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyles[row.Status] || 'bg-white/10 text-white/50 border-white/10'}`}>
                        {row.Status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/30">
                      {row.SubmittedAt ? new Date(row.SubmittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="text-white/30 hover:text-sky-400 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
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
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-white/40 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal (view-only) */}
      <LinkingDetailModal
        requestId={selectedId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="view"
      />
    </div>
  );
}
