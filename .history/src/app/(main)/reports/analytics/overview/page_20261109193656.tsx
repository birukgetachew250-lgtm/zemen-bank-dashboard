'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  BarChart3,
  CircleDollarSign,
  CheckCircle2,
  Smartphone,
  Star,
  ArrowRightLeft,
  RefreshCw,
  Download,
  Landmark,
  Activity,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';
import { PageHeroBanner } from '@/components/layout/PageHeroBanner';
import { DataSourceBadge } from '@/components/reports/DemoDataBanner';
import { cn } from '@/lib/utils';

export default function OverviewMetricsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/overview?period=${dateRange}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const kpis = data?.kpis || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersPeriod: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    dau: 0,
    mau: 0,
    txVolume: 0,
    txValue: 0,
    feeRevenue: 0,
    successRate: 0,
    totalDevices: 0,
    activeDevices: 0,
    avgAppRating: 0,
    totalAppRatings: 0,
    whitelistedMigration: 0,
    migratedUsers: 0,
    wso2TotalCalls: 0,
    wso2AvgLatencyMs: 0,
  };

  const dailyData: any[] = data?.dailyData || [];
  const approvals = data?.approvals || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byType: [],
  };

  const exportOverviewCsv = () => {
    const headers = [
      'Date',
      'DAU',
      'MAU',
      'Transaction Volume',
      'Transaction Value (ETB)',
      'WSO2 Gateway Calls',
      'WSO2 Success Calls',
      'WSO2 Failed Calls',
    ];
    const rows = dailyData.map((d) => [
      d.date,
      d.dau,
      d.mau,
      d.txVolume,
      d.txValue,
      d.gatewayCalls || 0,
      d.gatewaySuccess || 0,
      d.gatewayFailed || 0,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zemen-executive-overview-${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeroBanner
        variant="indigo"
        icon={<BarChart3 className="h-6 w-6 text-indigo-300" />}
        title="Executive Overview Metrics"
        badge={<DataSourceBadge isLive={Boolean(data?.isLive)} />}
        subtitle="Real-time cross-module KPIs across USER_MODULE, LIMIT_CHARGE_MODULE, DEVICE_CONTROL_MODULE, MIGRATION_MODULE, and WSO2 Gateway"
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-9 w-36 bg-white/15 border-white/25 text-white text-xs rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="15d">Last 15 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={exportOverviewCsv}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl h-9 text-xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button
              onClick={fetchOverview}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl h-9 text-xs"
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              label: 'Total Registered Users',
              value: kpis.totalUsers.toLocaleString(),
              sub: `${kpis.activeUsers.toLocaleString()} active`,
            },
            {
              label: 'Linked Bank Accounts',
              value: kpis.totalAccounts.toLocaleString(),
              sub: `${kpis.activeAccounts.toLocaleString()} active CASA`,
            },
            {
              label: 'Transaction Volume',
              value: kpis.txVolume.toLocaleString(),
              sub: `Period: ${dateRange}`,
            },
            {
              label: 'Transaction Value',
              value: `ETB ${(kpis.txValue / 1000000).toFixed(2)}M`,
              sub: `ETB ${kpis.feeRevenue.toLocaleString()} fees`,
            },
            {
              label: 'Platform Success Rate',
              value: `${kpis.successRate}%`,
              sub: `${kpis.wso2AvgLatencyMs} ms avg gateway`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 rounded-xl px-3.5 py-2.5 backdrop-blur-sm border border-white/10"
            >
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/80 font-medium">{s.label}</p>
              <p className="text-[11px] text-white/60 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </PageHeroBanner>

      {/* Secondary Module KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Daily / Monthly Active (DAU / MAU)"
          value={`${kpis.dau.toLocaleString()} / ${kpis.mau.toLocaleString()}`}
          sub={`Stickiness: ${kpis.mau > 0 ? Math.round((kpis.dau / kpis.mau) * 100) : 0}%`}
          icon={<Users className="h-4 w-4 text-sky-500" />}
        />
        <MetricCard
          title="Enrolled Mobile Devices"
          value={kpis.totalDevices.toLocaleString()}
          sub={`${kpis.activeDevices.toLocaleString()} active in DEVICE_CONTROL`}
          icon={<Smartphone className="h-4 w-4 text-emerald-500" />}
        />
        <MetricCard
          title="Customer App Rating"
          value={`${kpis.avgAppRating} / 5.0`}
          sub={`${kpis.totalAppRatings.toLocaleString()} submitted reviews`}
          icon={<Star className="h-4 w-4 text-amber-500" />}
        />
        <MetricCard
          title="Bankworld App Migration"
          value={`${kpis.migratedUsers.toLocaleString()} / ${kpis.whitelistedMigration.toLocaleString()}`}
          sub={
            kpis.whitelistedMigration > 0
              ? `${Math.round((kpis.migratedUsers / kpis.whitelistedMigration) * 100)}% migrated to SuperApp`
              : 'MIGRATION_MODULE'
          }
          icon={<ArrowRightLeft className="h-4 w-4 text-indigo-500" />}
        />
        <MetricCard
          title="WSO2 Gateway Calls"
          value={kpis.wso2TotalCalls.toLocaleString()}
          sub={`Avg response: ${kpis.wso2AvgLatencyMs} ms`}
          icon={<Activity className="h-4 w-4 text-rose-500" />}
        />
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Active Users &amp; Gateway Traffic Trend ({dateRange})
                </CardTitle>
                <CardDescription>
                  Daily Active Users (DAU) alongside WSO2 API Gateway volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="ovDauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ovGwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="date" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" fontSize={11} tickLine={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="dau"
                      name="Daily Active Users (DAU)"
                      stroke="#6366f1"
                      fill="url(#ovDauGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="gatewayCalls"
                      name="WSO2 Gateway Calls"
                      stroke="#10b981"
                      fill="url(#ovGwGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Transaction Volume &amp; Value (ETB)
                </CardTitle>
                <CardDescription>
                  Daily processed transaction count and total ETB value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="date" fontSize={11} tickLine={false} />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(v) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : `${(v / 1000).toFixed(0)}k`
                      }
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="txValue"
                      name="Value (ETB)"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="txVolume"
                      name="Tx Count"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Maker-Checker Operations Summary Card */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  Maker–Checker Back-Office Operations Summary
                </CardTitle>
                <CardDescription>
                  Live breakdown of administrative customer &amp; account workflow requests
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Total: {approvals.total}</Badge>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  Approved: {approvals.approved}
                </Badge>
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                  Pending: {approvals.pending}
                </Badge>
                <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
                  Rejected: {approvals.rejected}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {approvals.byType.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Maker–Checker workflow requests recorded yet.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {approvals.byType.map((item: any) => (
                    <div
                      key={item.type}
                      className="rounded-xl border border-border/70 bg-muted/25 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {item.type}
                        </span>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {item.total}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ {item.approved}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          ⏳ {item.pending}
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          ✕ {item.rejected}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
