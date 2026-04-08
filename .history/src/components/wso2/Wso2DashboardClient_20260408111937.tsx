'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DailyRow { LOG_DATE: string; TOTAL: number; SUCCESSES: number; FAILURES: number; }
interface StatusRow { STATUS: string; CNT: number; }
interface MethodRow { HTTP_METHOD: string; CNT: number; }
interface EndpointRow { SERVICE_NAME: string; ENDPOINT_URL: string; AVG_MS?: number; MAX_MS?: number; MIN_MS?: number; CALL_COUNT: number; FAIL_COUNT?: number; FAIL_RATE_PCT?: number; }
interface HourRow { HOUR_OF_DAY: string; CNT: number; }
interface ServiceAvgRow { SERVICE_NAME: string; AVG_MS: number; CALL_COUNT: number; FAIL_COUNT: number; }
interface RecentErrorRow { SERVICE_NAME: string; ENDPOINT_URL: string; STATUS: string; ERROR_CODE: string | null; REMARKS: string | null; CREATED_DATE: string; }

interface Stats {
  configurations: { total: number; active: number; inactive: number };
  credentials: { total: number; active: number };
  today: { total: number; successes: number; failures: number; avgResponseMs: number; successRate: number };
  allTime: { total: number };
  dailyVolume: DailyRow[];
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

// ─── Mini stat card ──────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon, iconBg, trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('h-9 w-9 flex items-center justify-center rounded-lg text-white', iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline">{value}</div>
        {sub && (
          <p className={cn('text-xs mt-1 flex items-center gap-1',
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          )}>
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

// ─── Daily sparkline (CSS columns) ───────────────────────────────────────────

function Sparkline({ data }: { data: DailyRow[] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">No data for last 30 days.</p>;
  const maxVal = Math.max(...data.map((d) => d.TOTAL), 1);
  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((d, i) => {
        const pct = Math.max(4, Math.round((d.TOTAL / maxVal) * 100));
        const failPct = d.TOTAL > 0 ? Math.round((d.FAILURES / d.TOTAL) * 100) : 0;
        const dateLabel = typeof d.LOG_DATE === 'string'
          ? d.LOG_DATE.slice(0, 10)
          : new Date(d.LOG_DATE).toLocaleDateString();
        return (
          <div
            key={i}
            className="group relative flex-1 flex flex-col justify-end cursor-default"
            title={`${dateLabel}\nTotal: ${d.TOTAL}\nSuccess: ${d.SUCCESSES}\nFailed: ${d.FAILURES}`}
          >
            <div
              className={cn('w-full rounded-sm', failPct > 20 ? 'bg-red-400' : 'bg-primary/70')}
              style={{ height: `${pct}%` }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border text-xs px-1.5 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
              {dateLabel}: {d.TOTAL.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Hourly heatmap ───────────────────────────────────────────────────────────

function HourlyChart({ data }: { data: HourRow[] }) {
  const map: Record<string, number> = {};
  data.forEach((h) => { map[h.HOUR_OF_DAY] = Number(h.CNT); });
  const maxVal = Math.max(...Object.values(map), 1);

  return (
    <div className="flex items-end gap-1 h-12">
      {Array.from({ length: 24 }, (_, i) => {
        const hour = String(i).padStart(2, '0');
        const cnt = map[hour] || 0;
        const pct = Math.max(4, Math.round((cnt / maxVal) * 100));
        return (
          <div
            key={hour}
            className="group relative flex-1 flex flex-col justify-end cursor-default"
            title={`${hour}:00 — ${cnt} requests`}
          >
            <div
              className="w-full rounded-sm bg-primary/60 hover:bg-primary transition-colors"
              style={{ height: `${pct}%` }}
            />
          </div>
        );
      })}
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
              <p className="text-xs text-muted-foreground truncate">{r.ENDPOINT_URL}</p>
            </div>
            <Badge variant={badgeVariant || 'secondary'} className="shrink-0 text-xs">
              {Number(r[metricKey] ?? 0).toLocaleString()} {metricLabel}
            </Badge>
          </div>
          <InlineBar value={Number(r[metricKey] ?? 0)} max={maxVal} color={metricColor} />
          <p className="text-xs text-muted-foreground">{Number(r.CALL_COUNT).toLocaleString()} total calls</p>
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
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wso2/statistics');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      setStats(await res.json());
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message);
      toast({ title: 'Failed to load WSO2 statistics', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

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
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">Could not load statistics</p>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={fetchStats}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
      </div>
    );
  }

  if (!stats) return null;

  const { configurations: cfg, credentials: creds, today, allTime } = stats;

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
    FAILED: 'bg-red-500',
    ERROR: 'bg-orange-500',
    PENDING: 'bg-yellow-500',
    TIMEOUT: 'bg-purple-500',
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-headline font-semibold">WSO2 Integration Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* ── Top KPI row ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total API Configurations"
          value={cfg.total.toLocaleString()}
          sub={`${cfg.active} active · ${cfg.inactive} inactive`}
          icon={<Settings className="h-5 w-5" />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="OAuth Credentials"
          value={creds.total.toLocaleString()}
          sub={`${creds.active} active`}
          icon={<KeyRound className="h-5 w-5" />}
          iconBg="bg-purple-600"
        />
        <StatCard
          title="Requests Today"
          value={today.total.toLocaleString()}
          sub={`${today.successRate}% success rate`}
          icon={<Activity className="h-5 w-5" />}
          iconBg={today.successRate < 90 ? 'bg-red-600' : 'bg-green-600'}
          trend={today.successRate >= 95 ? 'up' : today.successRate < 80 ? 'down' : 'neutral'}
        />
        <StatCard
          title="All-Time Requests"
          value={Number(allTime.total).toLocaleString()}
          icon={<Globe className="h-5 w-5" />}
          iconBg="bg-slate-600"
        />
      </div>

      {/* ── Today detail row ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Successful Today"
          value={today.successes.toLocaleString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-green-600"
        />
        <StatCard
          title="Failed Today"
          value={today.failures.toLocaleString()}
          sub={today.total > 0 ? `${Math.round((today.failures / today.total) * 100)}% failure rate` : undefined}
          icon={<XCircle className="h-5 w-5" />}
          iconBg="bg-red-600"
          trend={today.failures > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Avg Response Time"
          value={today.avgResponseMs ? `${today.avgResponseMs.toLocaleString()} ms` : '—'}
          sub="today's average"
          icon={<Gauge className="h-5 w-5" />}
          iconBg={today.avgResponseMs > 3000 ? 'bg-orange-500' : 'bg-teal-600'}
          trend={today.avgResponseMs > 3000 ? 'down' : 'up'}
        />
        <StatCard
          title="Active Integrations"
          value={cfg.active.toLocaleString()}
          sub={`out of ${cfg.total} configured`}
          icon={<Zap className="h-5 w-5" />}
          iconBg="bg-amber-600"
        />
      </div>

      {/* ── Daily volume sparkline + hourly heatmap ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4 text-primary" />
              Daily Request Volume (Last 30 Days)
            </CardTitle>
            <CardDescription>Red bars indicate &gt;20% failure rate that day</CardDescription>
          </CardHeader>
          <CardContent>
            <Sparkline data={stats.dailyVolume} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {stats.dailyVolume.length > 0 && (
                <>
                  <span>{typeof stats.dailyVolume[0].LOG_DATE === 'string'
                    ? stats.dailyVolume[0].LOG_DATE.slice(0, 10)
                    : new Date(stats.dailyVolume[0].LOG_DATE).toLocaleDateString()}</span>
                  <span>{typeof stats.dailyVolume[stats.dailyVolume.length - 1].LOG_DATE === 'string'
                    ? stats.dailyVolume[stats.dailyVolume.length - 1].LOG_DATE.slice(0, 10)
                    : new Date(stats.dailyVolume[stats.dailyVolume.length - 1].LOG_DATE).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Hourly Request Distribution (Today)
            </CardTitle>
            <CardDescription>Hour-by-hour traffic pattern — hover for count</CardDescription>
          </CardHeader>
          <CardContent>
            <HourlyChart data={stats.hourlyVolume} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Status breakdown + HTTP method distribution ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Status Breakdown</CardTitle>
            <CardDescription>All-time distribution by outcome</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.statusBreakdown.length === 0
              ? <p className="text-sm text-muted-foreground">No request data yet.</p>
              : stats.statusBreakdown.map((row) => {
                const pct = totalStatusCnt > 0 ? Math.round((Number(row.CNT) / totalStatusCnt) * 100) : 0;
                return (
                  <div key={row.STATUS} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={row.STATUS === 'SUCCESS' ? 'default' : 'destructive'}
                        className={cn('text-xs', statusColors[row.STATUS] || 'bg-gray-500')}
                      >
                        {row.STATUS}
                      </Badge>
                      <span className="text-sm font-medium">{Number(row.CNT).toLocaleString()} ({pct}%)</span>
                    </div>
                    <InlineBar value={Number(row.CNT)} max={totalStatusCnt} color={statusColors[row.STATUS] || 'bg-gray-400'} />
                  </div>
                );
              })
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Configurations by Method</CardTitle>
            <CardDescription>Distribution of configured HTTP methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.methodBreakdown.length === 0
              ? <p className="text-sm text-muted-foreground">No configurations yet.</p>
              : stats.methodBreakdown.map((row) => (
                <div key={row.HTTP_METHOD} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge className={cn('text-xs text-white', methodColors[row.HTTP_METHOD] || 'bg-gray-500')}>
                      {row.HTTP_METHOD}
                    </Badge>
                    <span className="text-sm font-medium">{Number(row.CNT)} configs</span>
                  </div>
                  <InlineBar value={Number(row.CNT)} max={maxMethodCnt} color={methodColors[row.HTTP_METHOD] || 'bg-gray-400'} />
                </div>
              ))
            }
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
            <CardDescription>By average response time (min 5 calls)</CardDescription>
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
            <CardDescription>By average response time (min 5 calls)</CardDescription>
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
            <CardDescription>By absolute failure count (all time)</CardDescription>
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

      {/* ── Most active endpoints + per-service avg ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Most Active Endpoints (Last 7 Days)
            </CardTitle>
            <CardDescription>Highest request volume</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointTable
              rows={stats.mostActiveEndpoints}
              metricLabel="calls"
              metricKey="CALL_COUNT"
              metricColor="bg-primary/60"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4 text-primary" />
              Avg Response by Service (Last 7 Days)
            </CardTitle>
            <CardDescription>Including failure rate per service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.avgResponseByService.length === 0
              ? <p className="text-sm text-muted-foreground">No data for last 7 days.</p>
              : (() => {
                  const maxMs = Math.max(...stats.avgResponseByService.map((r) => r.AVG_MS), 1);
                  return stats.avgResponseByService.map((r) => {
                    const failRate = r.CALL_COUNT > 0
                      ? Math.round((Number(r.FAIL_COUNT) / Number(r.CALL_COUNT)) * 100)
                      : 0;
                    return (
                      <div key={r.SERVICE_NAME} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate flex-1">{r.SERVICE_NAME}</p>
                          <div className="flex gap-2 shrink-0">
                            <Badge variant="secondary" className="text-xs">{Number(r.AVG_MS).toLocaleString()} ms</Badge>
                            {failRate > 0 && (
                              <Badge variant="destructive" className="text-xs">{failRate}% fail</Badge>
                            )}
                          </div>
                        </div>
                        <InlineBar
                          value={Number(r.AVG_MS)}
                          max={maxMs}
                          color={Number(r.AVG_MS) > 3000 ? 'bg-red-400' : Number(r.AVG_MS) > 1000 ? 'bg-orange-400' : 'bg-green-400'}
                        />
                        <p className="text-xs text-muted-foreground">{Number(r.CALL_COUNT).toLocaleString()} calls</p>
                      </div>
                    );
                  });
                })()
            }
          </CardContent>
        </Card>
      </div>

      {/* ── Recent errors ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Recent Errors (Last 24 Hours)
          </CardTitle>
          <CardDescription>Latest 10 failed/errored requests</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentErrors.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 py-2">
              <CheckCircle2 className="h-4 w-4" />
              No errors in the last 24 hours.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Service</th>
                    <th className="text-left py-2 pr-4 font-medium">Endpoint</th>
                    <th className="text-left py-2 pr-4 font-medium">Status</th>
                    <th className="text-left py-2 pr-4 font-medium">Error / Remarks</th>
                    <th className="text-left py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentErrors.map((e, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 pr-4 font-medium">{e.SERVICE_NAME}</td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">{e.ENDPOINT_URL}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="destructive" className="text-xs">{e.STATUS}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[240px] truncate">{e.ERROR_CODE ? `[${e.ERROR_CODE}] ` : ''}{e.REMARKS || '—'}</td>
                      <td className="py-2 text-muted-foreground whitespace-nowrap text-xs">
                        {e.CREATED_DATE
                          ? new Date(e.CREATED_DATE).toLocaleTimeString()
                          : '—'}
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
