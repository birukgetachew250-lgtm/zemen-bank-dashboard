'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Save,
  Download,
  RefreshCw,
  Table as TableIcon,
  Wrench,
  Loader2,
  Database,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeroBanner } from '@/components/layout/PageHeroBanner';
import { DataSourceBadge } from '@/components/reports/DemoDataBanner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

interface SavedTemplate {
  id: string;
  name: string;
  dataset: string;
  groupBy: string;
  metric: string;
  chartType: string;
}

const DEFAULT_TEMPLATES: SavedTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Customers by Branch',
    dataset: 'users',
    groupBy: 'branch',
    metric: 'users',
    chartType: 'bar',
  },
  {
    id: 'tpl-2',
    name: 'Transactions by Service Type',
    dataset: 'transactions',
    groupBy: 'type',
    metric: 'amount',
    chartType: 'bar',
  },
  {
    id: 'tpl-3',
    name: 'WSO2 Gateway Calls by Day',
    dataset: 'overview',
    groupBy: 'date',
    metric: 'gatewayCalls',
    chartType: 'area',
  },
  {
    id: 'tpl-4',
    name: 'Maker-Checker Requests by Type',
    dataset: 'approvals',
    groupBy: 'type',
    metric: 'total',
    chartType: 'pie',
  },
];

export default function CustomReportsBuilderPage() {
  const { toast } = useToast();
  const [dataset, setDataset] = useState<'users' | 'transactions' | 'overview' | 'approvals'>('users');
  const [groupBy, setGroupBy] = useState('branch');
  const [metric, setMetric] = useState('users');
  const [chartType, setChartType] = useState<'bar' | 'area' | 'pie' | 'table'>('bar');
  const [period, setPeriod] = useState('30d');
  const [reportName, setReportName] = useState('Branch Enrollment & Activity Report');
  const [templates, setTemplates] = useState<SavedTemplate[]>(DEFAULT_TEMPLATES);

  const [usersPayload, setUsersPayload] = useState<any>(null);
  const [txPayload, setTxPayload] = useState<any>(null);
  const [overviewPayload, setOverviewPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLiveSources = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, tRes, oRes] = await Promise.all([
        fetch('/api/stats/users', { cache: 'no-store' }),
        fetch(`/api/stats/transactions?period=${period}`, { cache: 'no-store' }),
        fetch(`/api/reports/overview?period=${period}`, { cache: 'no-store' }),
      ]);
      if (uRes.ok) setUsersPayload(await uRes.json());
      if (tRes.ok) setTxPayload(await tRes.json());
      if (oRes.ok) setOverviewPayload(await oRes.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLiveSources();
  }, [fetchLiveSources]);

  // Adjust valid groupBy and metric when dataset changes
  const handleDatasetChange = (val: 'users' | 'transactions' | 'overview' | 'approvals') => {
    setDataset(val);
    if (val === 'users') {
      setGroupBy('branch');
      setMetric('users');
    } else if (val === 'transactions') {
      setGroupBy('type');
      setMetric('amount');
    } else if (val === 'overview') {
      setGroupBy('date');
      setMetric('txValue');
    } else if (val === 'approvals') {
      setGroupBy('type');
      setMetric('total');
    }
  };

  // Compute aggregated chart rows dynamically from the selected live dataset
  const chartData = useMemo(() => {
    if (dataset === 'users') {
      if (groupBy === 'branch') {
        return (usersPayload?.branches || []).map((b: any) => ({
          label: b.name,
          users: Number(b.users || 0),
          activeUsers: Number(b.activeUsers || 0),
          share: Number(b.value || 0),
        }));
      }
      if (groupBy === 'month') {
        return (usersPayload?.data || []).map((m: any) => ({
          label: m.month,
          users: Number(m.newUsers || 0),
          activeUsers: Number(m.activeUsers || 0),
          totalUsers: Number(m.totalUsers || 0),
        }));
      }
      if (groupBy === 'channel') {
        return (usersPayload?.channels || []).map((c: any) => ({
          label: c.channel,
          users: Number(c.count || 0),
          activeUsers: Number(c.count || 0),
        }));
      }
      if (groupBy === 'accountType') {
        return (usersPayload?.accountTypes || []).map((a: any) => ({
          label: `${a.accountType} (${a.currency})`,
          users: Number(a.count || 0),
          activeUsers: Number(a.activeCount || 0),
        }));
      }
      if (groupBy === 'deviceOs') {
        return (usersPayload?.deviceOs || []).map((d: any) => ({
          label: d.os,
          users: Number(d.count || 0),
          activeUsers: Number(d.activeCount || 0),
        }));
      }
    }

    if (dataset === 'transactions') {
      const rows: any[] = txPayload?.data || [];
      const map: Record<string, { label: string; count: number; amount: number; fee: number }> = {};
      for (const tx of rows) {
        const key =
          groupBy === 'channel'
            ? tx.channel || 'Mobile'
            : groupBy === 'status'
            ? tx.status || 'Success'
            : groupBy === 'source'
            ? tx.source || 'Core Financial'
            : tx.type || 'Transfer';
        if (!map[key]) map[key] = { label: key, count: 0, amount: 0, fee: 0 };
        map[key].count += 1;
        map[key].amount += Number(tx.amount || 0);
        map[key].fee += Number(tx.fee || 0);
      }
      return Object.values(map).sort((a, b) => b.count - a.count);
    }

    if (dataset === 'overview') {
      return (overviewPayload?.dailyData || []).map((d: any) => ({
        label: d.date,
        dau: Number(d.dau || 0),
        txVolume: Number(d.txVolume || 0),
        txValue: Number(d.txValue || 0),
        gatewayCalls: Number(d.gatewayCalls || 0),
      }));
    }

    if (dataset === 'approvals') {
      return (overviewPayload?.approvals?.byType || []).map((a: any) => ({
        label: a.type,
        total: Number(a.total || 0),
        approved: Number(a.approved || 0),
        pending: Number(a.pending || 0),
        rejected: Number(a.rejected || 0),
      }));
    }

    return [];
  }, [dataset, groupBy, usersPayload, txPayload, overviewPayload]);

  const exportCustomCsv = () => {
    if (!chartData.length) return;
    const keys = Object.keys(chartData[0]);
    const csv = [
      keys.join(','),
      ...chartData.map((row: any) =>
        keys
          .map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const saveCurrentTemplate = () => {
    const newTpl: SavedTemplate = {
      id: `tpl-${Date.now()}`,
      name: reportName || 'Custom Report',
      dataset,
      groupBy,
      metric,
      chartType,
    };
    setTemplates((prev) => [newTpl, ...prev]);
    toast({
      title: 'Report Preset Saved',
      description: `"${newTpl.name}" has been added to your saved presets.`,
    });
  };

  const applyTemplate = (tpl: SavedTemplate) => {
    setReportName(tpl.name);
    setDataset(tpl.dataset as any);
    setGroupBy(tpl.groupBy);
    setMetric(tpl.metric);
    setChartType(tpl.chartType as any);
  };

  const isLive = Boolean(
    usersPayload?.isLive || txPayload?.isLive || overviewPayload?.isLive
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeroBanner
        variant="indigo"
        icon={<Wrench className="h-6 w-6 text-indigo-300" />}
        title="Custom Analytics & Report Builder"
        badge={<DataSourceBadge isLive={isLive} />}
        subtitle="Build, visualize, and export custom cross-module reports directly from live Oracle & workflow datasets"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={exportCustomCsv}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button
              onClick={fetchLiveSources}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} /> Refresh Data
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Builder Controls */}
        <Card className="lg:col-span-1 border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Report Configuration</CardTitle>
            <CardDescription>Choose live data source, dimension, and metric</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Report Title</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-primary" /> Data Source Module
              </Label>
              <Select value={dataset} onValueChange={(v: any) => handleDatasetChange(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">
                    Customers, Branches &amp; Devices (USER_MODULE)
                  </SelectItem>
                  <SelectItem value="transactions">
                    Transactions &amp; Gateway (LIMIT_CHARGE + WSO2)
                  </SelectItem>
                  <SelectItem value="overview">
                    Daily Time-Series KPIs (Multi-Module)
                  </SelectItem>
                  <SelectItem value="approvals">
                    Maker–Checker Workflows (Approval DB)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Group By Dimension</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataset === 'users' && (
                    <>
                      <SelectItem value="branch">Branch Name</SelectItem>
                      <SelectItem value="month">Registration Month</SelectItem>
                      <SelectItem value="channel">Banking Channel (Mobile/USSD)</SelectItem>
                      <SelectItem value="accountType">Linked Account Product</SelectItem>
                      <SelectItem value="deviceOs">Mobile Device OS (Android/iOS)</SelectItem>
                    </>
                  )}
                  {dataset === 'transactions' && (
                    <>
                      <SelectItem value="type">Transaction / Service Type</SelectItem>
                      <SelectItem value="source">Source Module (Core / Mini-App / WSO2)</SelectItem>
                      <SelectItem value="channel">Channel</SelectItem>
                      <SelectItem value="status">Execution Status</SelectItem>
                    </>
                  )}
                  {dataset === 'overview' && (
                    <SelectItem value="date">Calendar Date</SelectItem>
                  )}
                  {dataset === 'approvals' && (
                    <SelectItem value="type">Workflow Request Type</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Primary Metric</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataset === 'users' && (
                    <>
                      <SelectItem value="users">Total Count</SelectItem>
                      <SelectItem value="activeUsers">Active Count</SelectItem>
                    </>
                  )}
                  {dataset === 'transactions' && (
                    <>
                      <SelectItem value="count">Transaction Count</SelectItem>
                      <SelectItem value="amount">Total Monetary Value (ETB)</SelectItem>
                      <SelectItem value="fee">Total Fee Revenue (ETB)</SelectItem>
                    </>
                  )}
                  {dataset === 'overview' && (
                    <>
                      <SelectItem value="txValue">Transaction Value (ETB)</SelectItem>
                      <SelectItem value="txVolume">Transaction Volume</SelectItem>
                      <SelectItem value="dau">Daily Active Users (DAU)</SelectItem>
                      <SelectItem value="gatewayCalls">WSO2 Gateway Calls</SelectItem>
                    </>
                  )}
                  {dataset === 'approvals' && (
                    <>
                      <SelectItem value="total">Total Requests</SelectItem>
                      <SelectItem value="approved">Approved Requests</SelectItem>
                      <SelectItem value="pending">Pending Requests</SelectItem>
                      <SelectItem value="rejected">Rejected Requests</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Visualization Type</Label>
              <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area / Line Trend</SelectItem>
                  <SelectItem value="pie">Pie Distribution</SelectItem>
                  <SelectItem value="table">Tabular Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Time Window</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="15d">Last 15 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={saveCurrentTemplate} className="w-full h-9 text-xs">
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Report Preset
            </Button>

            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saved Report Presets
              </p>
              <div className="space-y-1.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="w-full text-left rounded-lg border border-border/70 bg-muted/25 px-2.5 py-2 text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    <p className="font-semibold truncate">{tpl.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tpl.dataset} · group by {tpl.groupBy}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview & Data Table Pane */}
        <Card className="lg:col-span-3 flex flex-col border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{reportName}</CardTitle>
              <CardDescription>
                Live aggregation from <span className="font-mono font-semibold">{dataset}</span> grouped by{' '}
                <span className="font-mono font-semibold">{groupBy}</span> · Metric:{' '}
                <span className="font-mono font-semibold">{metric}</span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {chartData.length} groups
            </Badge>
          </CardHeader>

          <CardContent className="flex-grow space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
                No records found for this dimension.
              </div>
            ) : (
              <>
                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey={metric}
                        name={metric}
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'area' && (
                  <ResponsiveContainer width="100%" height={340}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="customAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey={metric}
                        name={metric}
                        stroke="#10b981"
                        fill="url(#customAreaGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey={metric}
                        nameKey="label"
                        label={(entry) => `${entry.label}: ${entry[metric]}`}
                      >
                        {chartData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Underlying Data Table */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    Aggregated Result Matrix
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/20">
                          {Object.keys(chartData[0] || {}).map((k) => (
                            <th key={k} className="px-4 py-2 text-left font-semibold uppercase">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                            {Object.keys(row).map((k) => (
                              <td key={k} className="px-4 py-2 font-mono">
                                {typeof row[k] === 'number'
                                  ? row[k].toLocaleString()
                                  : String(row[k])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground">
              Data queried directly from connected SuperApp databases
            </span>
            <Button variant="secondary" size="sm" onClick={exportCustomCsv}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download CSV Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
