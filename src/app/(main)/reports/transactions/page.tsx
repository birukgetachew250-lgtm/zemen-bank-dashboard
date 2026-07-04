'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRightLeft, Loader2, Download, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataSourceBadge } from '@/components/reports/DemoDataBanner';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string; amount: number; fee: number; type: string;
  status: string; channel: string; date: string;
  fromAccount: string; toAccount: string;
}

const STATUS_COLOR: Record<string, string> = {
  Success: 'bg-green-100 text-green-700 border-green-200',
  Failed:  'bg-red-100 text-red-700 border-red-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
};

const PAGE_SIZE = 15;

export default function TransactionReportsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats/transactions?period=${period}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setIsLive(json.isLive);
        setPage(1);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let d = data;
    if (search) { const t = search.toLowerCase(); d = d.filter(tx => tx.id.toLowerCase().includes(t) || tx.fromAccount?.includes(t) || tx.toAccount?.includes(t)); }
    if (statusFilter !== 'All') d = d.filter(tx => tx.status === statusFilter);
    if (typeFilter !== 'All') d = d.filter(tx => tx.type === typeFilter);
    return d;
  }, [data, search, statusFilter, typeFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const types = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.type)))], [data]);

  const exportCsv = () => {
    const headers = ['ID', 'Type', 'Amount', 'Fee', 'Status', 'Channel', 'Date', 'From', 'To'];
    const rows = filtered.map(t => [t.id, t.type, t.amount, t.fee, t.status, t.channel, t.date, t.fromAccount, t.toAccount]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `transactions-${period}.csv`;
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const totalVol = filtered.reduce((s, t) => s + t.amount, 0);
  const successRate = filtered.length ? Math.round(filtered.filter(t => t.status === 'Success').length / filtered.length * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(233,55%,48%) 0%, hsl(233,55%,35%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
              <ArrowRightLeft className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Transaction Reports</h1>
                <DataSourceBadge isLive={isLive} />
              </div>
              <p className="text-white/60 text-sm mt-0.5">Detailed transaction history with filtering and CSV export</p>
            </div>
          </div>
          <Button onClick={exportCsv} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
        <div className="relative mt-4 grid grid-cols-4 gap-3">
          {[
            { label: 'Total Transactions', value: filtered.length.toLocaleString() },
            { label: 'Total Volume', value: `ETB ${(totalVol / 1000).toFixed(1)}K` },
            { label: 'Success Rate', value: `${successRate}%` },
            { label: 'Period', value: period === '7d' ? 'Last 7 days' : period === '90d' ? 'Last 90 days' : 'Last 30 days' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 rounded-xl" placeholder="Search by ID or account..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={period} onValueChange={v => { setPeriod(v); setPage(1); }}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Success">Success</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="rounded-xl" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['ID', 'Type', 'Amount', 'Fee', 'Status', 'Channel', 'From Account', 'To Account', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-muted-foreground">No transactions found</td></tr>
              ) : paginated.map(tx => (
                <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{tx.type}</Badge></td>
                  <td className="px-4 py-3 font-semibold">ETB {tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.fee}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', STATUS_COLOR[tx.status] || '')}>{tx.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.channel}</td>
                  <td className="px-4 py-3 font-mono text-xs">{tx.fromAccount}</td>
                  <td className="px-4 py-3 font-mono text-xs">{tx.toAccount}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm text-muted-foreground">
          <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg h-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
            <span className="px-2 text-xs">Page {page} / {totalPages}</span>
            <Button variant="outline" size="sm" className="rounded-lg h-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
