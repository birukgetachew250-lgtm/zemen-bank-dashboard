'use client';

import { PageHeroBanner } from '@/components/layout/PageHeroBanner';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowRightLeft,
  Loader2,
  Download,
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataSourceBadge } from '@/components/reports/DemoDataBanner';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  cif?: string;
  customerName?: string;
  amount: number;
  fee: number;
  currency?: string;
  type: string;
  serviceName?: string;
  source?: string;
  status: string;
  channel: string;
  date: string;
  fromAccount: string;
  toAccount: string;
  latencyMs?: number | null;
  remarks?: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  Success:
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  Failed: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  Pending:
    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
};

const PAGE_SIZE = 20;

export default function TransactionReportsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stats/transactions?period=${period}&source=${sourceFilter}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setIsLive(Boolean(json.isLive));
        setPage(1);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [period, sourceFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let d = data;
    if (search.trim()) {
      const t = search.trim().toLowerCase();
      d = d.filter(
        (tx) =>
          tx.id?.toLowerCase().includes(t) ||
          tx.cif?.toLowerCase().includes(t) ||
          tx.customerName?.toLowerCase().includes(t) ||
          tx.type?.toLowerCase().includes(t) ||
          tx.fromAccount?.toLowerCase().includes(t) ||
          tx.toAccount?.toLowerCase().includes(t) ||
          tx.remarks?.toLowerCase().includes(t)
      );
    }
    if (statusFilter !== 'All') d = d.filter((tx) => tx.status === statusFilter);
    if (typeFilter !== 'All') d = d.filter((tx) => tx.type === typeFilter);
    return d;
  }, [data, search, statusFilter, typeFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const types = useMemo(
    () => ['All', ...Array.from(new Set(data.map((d) => d.type).filter(Boolean)))],
    [data]
  );

  const exportCsv = () => {
    const headers = [
      'ID / Reference',
      'Source Module',
      'CIF / Initiator',
      'Customer',
      'Type / Service',
      'Amount (ETB)',
      'Fee (ETB)',
      'Status',
      'Channel',
      'From / Source',
      'To / Target',
      'Date',
      'Remarks',
    ];
    const rows = filtered.map((t) => [
      `"${(t.id || '').replace(/"/g, '""')}"`,
      `"${(t.source || 'Core Financial').replace(/"/g, '""')}"`,
      `"${(t.cif || '').replace(/"/g, '""')}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${(t.type || '').replace(/"/g, '""')}"`,
      t.amount,
      t.fee,
      t.status,
      `"${(t.channel || '').replace(/"/g, '""')}"`,
      `"${(t.fromAccount || '').replace(/"/g, '""')}"`,
      `"${(t.toAccount || '').replace(/"/g, '""')}"`,
      t.date,
      `"${(t.remarks || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zemen-transactions-${period}-${sourceFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const totalVol = filtered.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalFees = filtered.reduce((s, t) => s + (Number(t.fee) || 0), 0);
  const successRate = filtered.length
    ? Math.round(
        (filtered.filter((t) => t.status === 'Success').length / filtered.length) *
          1000
      ) / 10
    : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeroBanner
        variant="indigo"
        icon={<ArrowRightLeft className="h-6 w-6 text-indigo-300" />}
        title="Unified Transaction & Gateway Reports"
        badge={<DataSourceBadge isLive={isLive} />}
        subtitle="Integrated transaction history across LIMIT_CHARGE_MODULE (Core Financial), APP_CONTROL_MODULE (Mini-Apps), and WSO2_MODULE"
        actions={
          <Button
            onClick={exportCsv}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV ({filtered.length})
          </Button>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Matching Records', value: filtered.length.toLocaleString() },
            {
              label: 'Total Monetary Volume',
              value: `ETB ${totalVol.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            },
            {
              label: 'Total Fee Revenue',
              value: `ETB ${totalFees.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            },
            { label: 'Success Rate', value: `${successRate}%` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm border border-white/10"
            >
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </PageHeroBanner>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-xl"
            placeholder="Search by Reference ID, CIF, Account, Service, or Remarks…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={sourceFilter}
          onValueChange={(v) => {
            setSourceFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="All Data Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources (Unified)</SelectItem>
            <SelectItem value="core">Core Financial (LIMIT_CHARGE)</SelectItem>
            <SelectItem value="miniapp">Mini-App Payments (APP_CONTROL)</SelectItem>
            <SelectItem value="wso2">WSO2 API Gateway (WSO2_LOGS)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={period}
          onValueChange={(v) => {
            setPeriod(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="15d">Last 15 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Success">Success</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {[
                  'Reference ID',
                  'Source',
                  'CIF / User',
                  'Service / Type',
                  'Amount',
                  'Fee',
                  'Status',
                  'Channel',
                  'From / Source',
                  'To / Target',
                  'Date',
                  'Inspect',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-16 text-muted-foreground">
                    No transactions matched your filters
                  </td>
                </tr>
              ) : (
                paginated.map((tx, idx) => (
                  <tr
                    key={`${tx.id}-${idx}`}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                      {tx.id}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[11px]">
                        {tx.source || 'Core Financial'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{tx.cif || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {tx.amount > 0
                        ? `ETB ${tx.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {tx.fee > 0 ? `ETB ${tx.fee.toLocaleString()}` : '0.00'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                          STATUS_COLOR[tx.status] || ''
                        )}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{tx.channel}</td>
                    <td className="px-4 py-3 font-mono text-xs max-w-[140px] truncate">
                      {tx.fromAccount}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs max-w-[160px] truncate">
                      {tx.toAccount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => setSelectedTx(tx)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm text-muted-foreground">
          <span>
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-7"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </Button>
            <span className="px-2 text-xs">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-7"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Transaction Record</span>
                <Badge variant="outline">{selectedTx.status}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm pt-2">
              {[
                ['Reference / ID', selectedTx.id],
                ['Source Module', selectedTx.source || 'Core Financial'],
                ['Customer CIF', selectedTx.cif || '—'],
                ['Customer / Initiator', selectedTx.customerName || '—'],
                ['Transaction Type', selectedTx.type],
                ['Channel', selectedTx.channel],
                [
                  'Amount',
                  selectedTx.amount > 0
                    ? `ETB ${selectedTx.amount.toLocaleString()}`
                    : 'Non-monetary / Gateway Call',
                ],
                ['Fee / Charge', `ETB ${selectedTx.fee.toLocaleString()}`],
                ['From / Source', selectedTx.fromAccount],
                ['To / Target', selectedTx.toAccount],
                [
                  'Execution Latency',
                  selectedTx.latencyMs ? `${selectedTx.latencyMs} ms` : '—',
                ],
                ['Timestamp', new Date(selectedTx.date).toLocaleString()],
              ].map(([label, val]) => (
                <div key={String(label)} className="rounded-lg border p-2.5 bg-muted/20">
                  <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
                  <p className="font-mono text-xs font-semibold break-all mt-0.5">
                    {String(val)}
                  </p>
                </div>
              ))}
              {selectedTx.remarks && (
                <div className="col-span-2 rounded-lg border p-2.5 bg-muted/20">
                  <p className="text-[11px] text-muted-foreground uppercase">
                    Remarks / Error Detail
                  </p>
                  <p className="font-mono text-xs mt-0.5 break-all">{selectedTx.remarks}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
