'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Settings,
  KeyRound,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  Gauge,
  Globe,
  Calendar,
  Download,
  Search,
  FileSpreadsheet,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DailyRow {
  LOG_DATE: string;
  TOTAL: number;
  SUCCESSES: number;
  FAILURES: number;
  PENDING?: number;
  AVG_MS?: number;
  UNIQUE_SERVICES?: number;
}

interface DailyServiceReportRow {
  SERVICE_NAME: string;
  ENDPOINT_URL: string | null;
  HTTP_METHOD: string | null;
  TOTAL_CALLS: number;
  SUCCESS_COUNT: number;
  FAIL_COUNT: number;
  PENDING_COUNT: number;
  SUCCESS_RATE: number;
  AVG_MS: number;
  MIN_MS: number;
  MAX_MS: number;
  LAST_CALLED_AT: string | null;
}

interface StatusRow {
  STATUS: string;
  CNT: number;
}
interface MethodRow {
  HTTP_METHOD: string;
  CNT: number;
}
interface EndpointRow {
  SERVICE_NAME: string;
  ENDPOINT_URL: string;
  AVG_MS?: number;
  MAX_MS?: number;
  MIN_MS?: number;
  CALL_COUNT: number;
  FAIL_COUNT?: number;
  FAIL_RATE_PCT?: number;
}
interface HourRow {
  HOUR_OF_DAY: string;
  CNT: number;
  SUCCESSES?: number;
  FAILURES?: number;
  AVG_MS?: number;
}
interface ServiceAvgRow {
  SERVICE_NAME: string;
  AVG_MS: number;
  CALL_COUNT: number;
  FAIL_COUNT: number;
}
interface RecentErrorRow {
  ID?: string;
  REQUEST_ID?: string;
  SERVICE_NAME: string;
  ENDPOINT_URL: string;
  HTTP_STATUS_CODE?: number | null;
  STATUS: string;
  ERROR_CODE: string | null;
  REMARKS: string | null;
  EXECUTION_TIME_MS?: number | null;
  CREATED_DATE: string;
}

interface Stats {
  reportDate: string;
  daysWindow: number;
  configurations: { total: number; active: number; inactive: number };
  credentials: { total: number; active: number };
  today: {
    total: number;
    successes: number;
    failures: number;
    pending: number;
    avgResponseMs: number;
    minResponseMs: number;
    maxResponseMs: number;
    uniqueServices: number;
    successRate: number;
  };
  allTime: { total: number; last15DaysTotal?: number };
  dailyVolume: DailyRow[];
  dailyServiceReport: DailyServiceReportRow[];
  statusBreakdown: StatusRow[];
  methodBreakdown: MethodRow[];
  slowestEndpoints: EndpointRow[];
  fastestEndpoints: EndpointRow[];
  mostFailedEndpoints: EndpointRow[];
  mostActiveEndpoints: EndpointRow[];
  hourlyVolume: HourRow[];
  avgResponseByService: ServiceAvgRow[];
  recentErrors: RecentErrorRow[];
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ─── Mini stat card ──────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon,
  iconBg,
  trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('h-9 w-9 flex items-center justify-center rounded-lg text-white', iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline">{value}</div>
        {sub && (
          <p
            className={cn(
              'text-xs mt-1 flex items-center gap-1',
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                ? 'text-red-500'
                : 'text-muted-foreground'
            )}
          >
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Inline bar chart (CSS-only) ─────────────────────────────────────────────

function InlineBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={cn('h-2 rounded-full', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Endpoint table ───────────────────────────────────────────────────────────

function EndpointTable({
  rows,
  metricLabel,
  metricKey,
  metricColor,
  badgeVariant,
}: {
  rows: EndpointRow[];
  metricLabel: string;
  metricKey: keyof EndpointRow;
  metricColor: string;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
}) {
  if (!rows.length) return <p className="text-sm text-muted-foreground py-2">No data available.</p>;
  const maxVal = Math.max(...rows.map((r) => Number(r[metricKey] ?? 0)), 1);
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{r.SERVICE_NAME}</p>
              <p className="text-xs text-muted-foreground truncate">{r.ENDPOINT_URL || '—'}</p>
            </div>
            <Badge variant={badgeVariant || 'secondary'} className="shrink-0 text-xs">
              {Number(r[metricKey] ?? 0).toLocaleString()} {metricLabel}
            </Badge>
          </div>
          <InlineBar value={Number(r[metricKey] ?? 0)} max={maxVal} color={metricColor} />
          <p className="text-xs text-muted-foreground">
            {Number(r.CALL_COUNT).toLocaleString()} total calls
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Wso2DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [reportDate, setReportDate] = useState<string>(() => getTodayStr());
  const [daysWindow, setDaysWindow] = useState<string>('15');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (reportDate) params.set('date', reportDate);
      if (daysWindow) params.set('days', daysWindow);

      const res = await fetch(`/api/wso2/statistics?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      setStats(await res.json());
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message);
      toast({
        title: 'Failed to load WSO2 statistics',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [reportDate, daysWindow, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const hourlyFullData = useMemo(() => {
    const map: Record<string, HourRow> = {};
    (stats?.hourlyVolume || []).forEach((h) => {
      map[String(h.HOUR_OF_DAY).padStart(2, '0')] = h;
    });
    return Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, '0');
      const row = map[hour];
      return {
        hour: `${hour}:00`,
        total: Number(row?.CNT || 0),
        successes: Number(row?.SUCCESSES || 0),
        failures: Number(row?.FAILURES || 0),
        avgMs: Number(row?.AVG_MS || 0),
      };
    });
  }, [stats?.hourlyVolume]);

  const filteredDailyServices = useMemo(() => {
    const list = stats?.dailyServiceReport || [];
    if (!serviceSearch.trim()) return list;
    const q = serviceSearch.trim().toLowerCase();
    return list.filter(
      (s) =>
        String(s.SERVICE_NAME || '').toLowerCase().includes(q) ||
        String(s.ENDPOINT_URL || '').toLowerCase().includes(q)
    );
  }, [stats?.dailyServiceReport, serviceSearch]);

  const exportDailyServiceReportCsv = () => {
    if (!stats) return;
    const headers = [
      'Report Date',
      'Service Name',
      'HTTP Method',
      'Endpoint URL',
      'Total Calls',
      'Successful',
      'Failed',
      'Pending',
      'Success Rate (%)',
      'Avg Latency (ms)',
      'Min Latency (ms)',
      'Max Latency (ms)',
      'Last Called At',
    ];
    const rows = (stats.dailyServiceReport || []).map((r) => [
      stats.reportDate,
      `"${(r.SERVICE_NAME || '').replace(/"/g, '""')}"`,
      r.HTTP_METHOD || '',
      `"${(r.ENDPOINT_URL || '').replace(/"/g, '""')}"`,
      r.TOTAL_CALLS,
      r.SUCCESS_COUNT,
      r.FAIL_COUNT,
      r.PENDING_COUNT,
      r.SUCCESS_RATE,
      r.AVG_MS,
      r.MIN_MS,
      r.MAX_MS,
      r.LAST_CALLED_AT || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wso2-daily-service-report-${stats.reportDate}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportDailySummaryCsv = () => {
    if (!stats) return;
    const headers = [
      'Date',
      'Total Requests',
      'Successful',
      'Failed',
      'Pending',
      'Success Rate (%)',
      'Avg Latency (ms)',
      'Unique Services Active',
    ];
    const rows = (stats.dailyVolume || []).map((d) => {
      const total = Number(d.TOTAL || 0);
      const succ = Number(d.SUCCESSES || 0);
      const rate = total > 0 ? Math.round((succ / total) * 1000) / 10 : 0;
      return [
        d.LOG_DATE,
        total,
        succ,
        Number(d.FAILURES || 0),
        Number(d.PENDING || 0),
        rate,
        Number(d.AVG_MS || 0),
        Number(d.UNIQUE_SERVICES || 0),
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wso2-daily-trend-${daysWindow}d.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">Could not load WSO2 statistics</p>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const { configurations: cfg, credentials: creds, today, allTime } = stats;
  const isTodaySelected = reportDate === getTodayStr();

  const totalStatusCnt = stats.statusBreakdown.reduce((a, r) => a + Number(r.CNT), 0);
  const maxMethodCnt = Math.max(...stats.methodBreakdown.map((r) => Number(r.CNT)), 1);

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500',
  };

  const statusColors: Record<string, string> = {
    SUCCESS: 'bg-green-500',
    COMPLETED: 'bg-emerald-500',
    FAILED: 'bg-red-500',
    ERROR: 'bg-orange-500',
    PENDING: 'bg-yellow-500',
    TIMEOUT: 'bg-purple-500',
  };

  return (
    <div className="space-y-6">
      {/* ── Header & Daily Report Controls ───────────────────────────────── */}
      <Card className="border-border/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                  WSO2 API Gateway Analytics
                </Badge>
                <Badge variant="outline" className="border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
                  Report Date: {stats.reportDate} {isTodaySelected ? '(Today)' : ''}
                </Badge>
              </div>
              <h1 className="text-2xl font-headline font-bold mt-2">
                WSO2 Daily Report &amp; Integration Overview
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Daily service-level breakdown, hourly traffic distribution, latency benchmarks, and error diagnostics · Last refreshed: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 p-1 border border-white/15">
                <Button
                  type="button"
                  size="sm"
                  variant={reportDate === getTodayStr() ? 'secondary' : 'ghost'}
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setReportDate(getTodayStr())}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={reportDate === getYesterdayStr() ? 'secondary' : 'ghost'}
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setReportDate(getYesterdayStr())}
                >
                  Yesterday
                </Button>
                <div className="relative flex items-center">
                  <Calendar className="h-3.5 w-3.5 text-white/70 ml-2 mr-1" />
                  <input
                    type="date"
                    max={getTodayStr()}
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value || getTodayStr())}
                    className="h-7 rounded-md bg-transparent px-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <Select value={daysWindow} onValueChange={setDaysWindow}>
                <SelectTrigger className="h-9 w-[135px] bg-white/10 border-white/20 text-white text-xs">
                  <SelectValue placeholder="Trend Window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="15">Last 15 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={exportDailyServiceReportCsv}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export Daily CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={fetchStats}
                disabled={loading}
              >
                <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Selected Date KPI Row ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={`Requests on ${stats.reportDate}`}
          value={today.total.toLocaleString()}
          sub={`${today.successRate}% success rate · ${today.uniqueServices} active services`}
          icon={<Activity className="h-5 w-5" />}
          iconBg={today.successRate < 90 && today.total > 0 ? 'bg-red-600' : 'bg-emerald-600'}
          trend={today.successRate >= 95 ? 'up' : today.successRate < 80 && today.total > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title={`Successful (${stats.reportDate})`}
          value={today.successes.toLocaleString()}
          sub={`${today.pending.toLocaleString()} pending`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-green-600"
          trend="up"
        />
        <StatCard
          title={`Failed / Errors (${stats.reportDate})`}
          value={today.failures.toLocaleString()}
          sub={
            today.total > 0
              ? `${Math.round((today.failures / today.total) * 1000) / 10}% failure rate`
              : '0% failure rate'
          }
          icon={<XCircle className="h-5 w-5" />}
          iconBg="bg-red-600"
          trend={today.failures > 0 ? 'down' : 'up'}
        />
        <StatCard
          title={`Avg Latency (${stats.reportDate})`}
          value={today.avgResponseMs ? `${today.avgResponseMs.toLocaleString()} ms` : '—'}
          sub={
            today.maxResponseMs
              ? `Min: ${today.minResponseMs} ms · Max: ${today.maxResponseMs.toLocaleString()} ms`
              : 'No latency samples on this date'
          }
          icon={<Gauge className="h-5 w-5" />}
          iconBg={today.avgResponseMs > 3000 ? 'bg-orange-500' : 'bg-teal-600'}
          trend={today.avgResponseMs > 3000 ? 'down' : 'up'}
        />
      </div>

      {/* ── Secondary Infrastructure Row ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Configured WSO2 Services"
          value={cfg.total.toLocaleString()}
          sub={`${cfg.active} active · ${cfg.inactive} inactive`}
          icon={<Settings className="h-5 w-5" />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="OAuth2 Credentials"
          value={creds.total.toLocaleString()}
          sub={`${creds.active} active credentials`}
          icon={<KeyRound className="h-5 w-5" />}
          iconBg="bg-purple-600"
        />
        <StatCard
          title="Last 15 Days Requests"
          value={Number(allTime.last15DaysTotal ?? 0).toLocaleString()}
          sub="Active rolling log window"
          icon={<Zap className="h-5 w-5" />}
          iconBg="bg-amber-600"
        />
        <StatCard
          title="All-Time Logged Requests"
          value={Number(allTime.total).toLocaleString()}
          sub="Total historical gateway calls"
          icon={<Globe className="h-5 w-5" />}
          iconBg="bg-slate-600"
        />
      </div>

      {/* ── DAILY SERVICE-BY-SERVICE REPORT TABLE (FOR SELECTED DATE) ────── */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Daily Service Performance Report — {stats.reportDate}
            </CardTitle>
            <CardDescription>
              Complete breakdown of every WSO2 service invoked on {stats.reportDate} (calls, success/failure counts, success rate, and response time benchmarks)
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Filter service or endpoint…"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportDailyServiceReportCsv}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export Service CSV
            </Button>
            <Link href="/wso2/request-logs">
              <Button variant="secondary" size="sm" className="h-8 text-xs">
                Inspect Logs <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Service Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint URL</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Successful</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                  <TableHead className="text-right">Avg (ms)</TableHead>
                  <TableHead className="text-right">Min / Max (ms)</TableHead>
                  <TableHead>Last Called</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDailyServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                      No WSO2 service calls recorded on {stats.reportDate}. Select another date from the Daily Volume table below or date picker above.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDailyServices.map((row) => (
                    <TableRow key={row.SERVICE_NAME} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-sm">{row.SERVICE_NAME}</TableCell>
                      <TableCell>
                        {row.HTTP_METHOD ? (
                          <Badge variant="outline" className="text-xs font-mono">
                            {row.HTTP_METHOD}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell
                        className="max-w-[220px] truncate font-mono text-xs text-muted-foreground"
                        title={row.ENDPOINT_URL || ''}
                      >
                        {row.ENDPOINT_URL || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {row.TOTAL_CALLS.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {row.SUCCESS_COUNT.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-mono',
                          row.FAIL_COUNT > 0
                            ? 'font-bold text-red-600 dark:text-red-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {row.FAIL_COUNT.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">
                        {row.PENDING_COUNT.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-mono',
                            row.SUCCESS_RATE >= 95
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : row.SUCCESS_RATE >= 80
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                          )}
                        >
                          {row.SUCCESS_RATE}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {row.AVG_MS.toLocaleString()} ms
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {row.MIN_MS.toLocaleString()} / {row.MAX_MS.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {row.LAST_CALLED_AT
                          ? new Date(row.LAST_CALLED_AT).toLocaleTimeString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Daily Volume Trend Chart + Hourly Traffic Chart ──────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-4 w-4 text-primary" />
                Daily Request Volume (Last {stats.daysWindow} Days)
              </CardTitle>
              <CardDescription>
                Success vs. Failed requests per day — click any row in the daily table below to drill into that date
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={exportDailySummaryCsv}>
              <Download className="mr-1 h-3 w-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {stats.dailyVolume.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No daily request data found for the last {stats.daysWindow} days.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.dailyVolume}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="LOG_DATE" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="SUCCESSES"
                    name="Successful"
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="FAILURES"
                    name="Failed"
                    stackId="a"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Hourly Request Distribution ({stats.reportDate})
            </CardTitle>
            <CardDescription>
              Hour-by-hour traffic (00:00 – 23:00) on {stats.reportDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={hourlyFullData}>
                <defs>
                  <linearGradient id="wso2HourGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="hour" fontSize={10} interval={2} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Calls"
                  stroke="#6366f1"
                  fill="url(#wso2HourGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="failures"
                  name="Failures"
                  stroke="#ef4444"
                  fill="none"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Day-by-Day Historical Summary Table (Interactive Date Selector) ─ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Day-by-Day Summary Report (Last {stats.daysWindow} Days)
          </CardTitle>
          <CardDescription>
            Click any date row to load its full Daily Service Report above
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Requests</TableHead>
                  <TableHead className="text-right">Successful</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                  <TableHead className="text-right">Avg Latency</TableHead>
                  <TableHead className="text-right">Active Services</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.dailyVolume.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No daily logs recorded in the last {stats.daysWindow} days.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...stats.dailyVolume].reverse().map((d) => {
                    const total = Number(d.TOTAL || 0);
                    const succ = Number(d.SUCCESSES || 0);
                    const fail = Number(d.FAILURES || 0);
                    const pend = Number(d.PENDING || 0);
                    const rate = total > 0 ? Math.round((succ / total) * 1000) / 10 : 0;
                    const isSelected = d.LOG_DATE === stats.reportDate;
                    return (
                      <TableRow
                        key={d.LOG_DATE}
                        onClick={() => setReportDate(d.LOG_DATE)}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/40',
                          isSelected && 'bg-primary/10 font-medium'
                        )}
                      >
                        <TableCell className="font-mono text-xs font-semibold">
                          {d.LOG_DATE}
                          {isSelected && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              Viewing
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                          {succ.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono',
                            fail > 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'
                          )}
                        >
                          {fail.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-amber-600">
                          {pend.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{rate}%</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {Number(d.AVG_MS || 0).toLocaleString()} ms
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {Number(d.UNIQUE_SERVICES || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isSelected ? 'default' : 'ghost'}
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportDate(d.LOG_DATE);
                            }}
                          >
                            Load Day
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Status breakdown + HTTP method distribution ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Request Status Breakdown (Last {stats.daysWindow} Days)
            </CardTitle>
            <CardDescription>Distribution by execution outcome</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No request data yet.</p>
            ) : (
              stats.statusBreakdown.map((row) => {
                const pct =
                  totalStatusCnt > 0 ? Math.round((Number(row.CNT) / totalStatusCnt) * 100) : 0;
                return (
                  <div key={row.STATUS} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={row.STATUS === 'SUCCESS' ? 'default' : 'destructive'}
                        className={cn('text-xs', statusColors[row.STATUS] || 'bg-gray-500')}
                      >
                        {row.STATUS}
                      </Badge>
                      <span className="text-sm font-medium">
                        {Number(row.CNT).toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <InlineBar
                      value={Number(row.CNT)}
                      max={totalStatusCnt}
                      color={statusColors[row.STATUS] || 'bg-gray-400'}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Configurations by Method</CardTitle>
            <CardDescription>Distribution of configured HTTP methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.methodBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No configurations yet.</p>
            ) : (
              stats.methodBreakdown.map((row) => (
                <div key={row.HTTP_METHOD} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        'text-xs text-white',
                        methodColors[row.HTTP_METHOD] || 'bg-gray-500'
                      )}
                    >
                      {row.HTTP_METHOD}
                    </Badge>
                    <span className="text-sm font-medium">{Number(row.CNT)} configs</span>
                  </div>
                  <InlineBar
                    value={Number(row.CNT)}
                    max={maxMethodCnt}
                    color={methodColors[row.HTTP_METHOD] || 'bg-gray-400'}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Performance league tables ────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Slowest Endpoints
            </CardTitle>
            <CardDescription>By average response time (last {stats.daysWindow}d)</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointTable
              rows={stats.slowestEndpoints}
              metricLabel="ms avg"
              metricKey="AVG_MS"
              metricColor="bg-orange-400"
              badgeVariant="secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-green-500" />
              Fastest Endpoints
            </CardTitle>
            <CardDescription>By average response time (last {stats.daysWindow}d)</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointTable
              rows={stats.fastestEndpoints}
              metricLabel="ms avg"
              metricKey="AVG_MS"
              metricColor="bg-green-400"
              badgeVariant="secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4 text-red-500" />
              Most Failed Endpoints
            </CardTitle>
            <CardDescription>By failure count (last {stats.daysWindow}d)</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointTable
              rows={stats.mostFailedEndpoints}
              metricLabel="failures"
              metricKey="FAIL_COUNT"
              metricColor="bg-red-400"
              badgeVariant="destructive"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Errors on Selected Date ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Failed &amp; Errored Requests on {stats.reportDate}
          </CardTitle>
          <CardDescription>Latest 20 failed or HTTP 4xx/5xx requests on {stats.reportDate}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentErrors.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 py-2">
              <CheckCircle2 className="h-4 w-4" />
              No errors recorded on {stats.reportDate}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Service</th>
                    <th className="text-left py-2 pr-4 font-medium">Request ID</th>
                    <th className="text-left py-2 pr-4 font-medium">Endpoint</th>
                    <th className="text-left py-2 pr-4 font-medium">HTTP</th>
                    <th className="text-left py-2 pr-4 font-medium">Status</th>
                    <th className="text-left py-2 pr-4 font-medium">Error / Remarks</th>
                    <th className="text-left py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentErrors.map((e, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 pr-4 font-medium">{e.SERVICE_NAME}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                        {e.REQUEST_ID || '—'}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">
                        {e.ENDPOINT_URL || '—'}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-red-500">
                        {e.HTTP_STATUS_CODE || '—'}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="destructive" className="text-xs">
                          {e.STATUS}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[260px] truncate">
                        {e.ERROR_CODE ? `[${e.ERROR_CODE}] ` : ''}
                        {e.REMARKS || '—'}
                      </td>
                      <td className="py-2 text-muted-foreground whitespace-nowrap text-xs">
                        {e.CREATED_DATE ? new Date(e.CREATED_DATE).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
