'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Loader2,
  RefreshCw,
  Download,
  Building2,
  Smartphone,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataSourceBadge } from '@/components/reports/DemoDataBanner';
import { PageHeroBanner } from '@/components/layout/PageHeroBanner';
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function FinancialInclusionPage() {
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats/users', { cache: 'no-store' });
      if (res.ok) {
        setPayload(await res.json());
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userData: any[] = payload?.data || [];
  const isLive = Boolean(payload?.isLive);
  const summary = payload?.summary || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    pendingUsers: 0,
    ussdActiveUsers: 0,
    mfaEnabledUsers: 0,
  };
  const branchData: any[] = payload?.branches || [];
  const channels: any[] = payload?.channels || [];
  const accountTypes: any[] = payload?.accountTypes || [];
  const deviceOs: any[] = payload?.deviceOs || [];
  const migration = payload?.migration || {
    totalWhitelisted: 0,
    migratedCount: 0,
    pendingCount: 0,
  };

  const totalNewUsers = userData.reduce((a: number, b: any) => a + (b.newUsers || 0), 0);

  const exportBranchReportCsv = () => {
    const headers = ['Branch Name', 'Branch Code', 'Total Enrolled Users', 'Active Users', 'Share (%)'];
    const rows = branchData.map((b) => [
      `"${(b.name || '').replace(/"/g, '""')}"`,
      b.branchCode || '',
      b.users || 0,
      b.activeUsers || 0,
      b.value || 0,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zemen-financial-inclusion-branches.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeroBanner
        variant="emerald"
        icon={<TrendingUp className="h-6 w-6 text-emerald-200" />}
        title="Financial Inclusion & Channel Adoption"
        badge={<DataSourceBadge isLive={isLive} />}
        subtitle="Customer enrollment growth, branch-level distribution, USSD vs. Mobile adoption, linked account types, and Bankworld migration"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={exportBranchReportCsv}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
            >
              <Download className="mr-2 h-4 w-4" /> Export Branch CSV
            </Button>
            <Button
              onClick={fetchData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              label: 'Total Enrolled Users',
              value: summary.totalUsers.toLocaleString(),
              sub: `${summary.activeUsers.toLocaleString()} active mobile`,
            },
            {
              label: 'New Enrollments (12M)',
              value: totalNewUsers.toLocaleString(),
              sub: `Avg ${
                userData.length ? Math.round(totalNewUsers / userData.length).toLocaleString() : 0
              }/mo`,
            },
            {
              label: 'USSD Active Users',
              value: summary.ussdActiveUsers.toLocaleString(),
              sub: 'Feature-phone inclusion',
            },
            {
              label: 'MFA Protected Users',
              value: summary.mfaEnabledUsers.toLocaleString(),
              sub: '2FA enabled in AppUsers',
            },
            {
              label: 'Migrated from Legacy App',
              value: `${migration.migratedCount.toLocaleString()} / ${migration.totalWhitelisted.toLocaleString()}`,
              sub: `${migration.pendingCount.toLocaleString()} pending migration`,
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

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User growth area chart */}
            <Card className="lg:col-span-2 border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Monthly Customer Onboarding &amp; Active Base (USER_MODULE.AppUsers)
                </CardTitle>
                <CardDescription>
                  New customer registrations vs. cumulative active users over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={userData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="newUsersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
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
                      dataKey="newUsers"
                      stroke="#10b981"
                      fill="url(#newUsersGrad)"
                      strokeWidth={2}
                      name="New Registrations"
                    />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#3b82f6"
                      fill="none"
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Branch distribution pie */}
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Share by Branch</CardTitle>
                <CardDescription>
                  Distribution across Zemen Bank branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={branchData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      nameKey="name"
                    >
                      {branchData.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {branchData.slice(0, 6).map((b, i) => (
                    <div key={b.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="truncate">{b.name}</span>
                      </div>
                      <span className="font-mono font-semibold shrink-0">
                        {b.users?.toLocaleString()} ({b.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel, Account Types, and Device OS Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Channel &amp; Device OS Adoption
                </CardTitle>
                <CardDescription>
                  Enrolled banking channels and mobile operating systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Enrolled Channels
                  </p>
                  {channels.map((ch: any) => (
                    <div
                      key={ch.channel}
                      className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-xs"
                    >
                      <span className="font-medium">{ch.channel}</span>
                      <Badge variant="secondary" className="font-mono">
                        {Number(ch.count).toLocaleString()} users
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Registered Device OS (DEVICE_CONTROL_MODULE)
                  </p>
                  {deviceOs.map((d: any) => (
                    <div
                      key={d.os}
                      className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-xs"
                    >
                      <span className="font-medium">{d.os}</span>
                      <span className="font-mono font-semibold">
                        {Number(d.count).toLocaleString()} ({Number(d.activeCount).toLocaleString()} active)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Landmark className="h-4 w-4 text-primary" />
                  Linked Bank Account Products
                </CardTitle>
                <CardDescription>
                  Breakdown of linked accounts in USER_MODULE.Accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {accountTypes.map((acc: any, idx: number) => (
                  <div
                    key={`${acc.accountType}-${acc.currency}-${idx}`}
                    className="flex items-center justify-between rounded-xl border p-3 bg-muted/20"
                  >
                    <div>
                      <p className="text-sm font-semibold">{acc.accountType}</p>
                      <p className="text-xs text-muted-foreground">Currency: {acc.currency}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="font-mono text-xs">
                        {Number(acc.count).toLocaleString()} linked
                      </Badge>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {Number(acc.activeCount).toLocaleString()} active
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-primary" />
                  Branch Enrollment Leaderboard
                </CardTitle>
                <CardDescription>
                  Top branches by registered SuperApp customers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto px-6 pb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="py-2 text-left">Branch</th>
                        <th className="py-2 text-right">Total</th>
                        <th className="py-2 text-right">Active</th>
                        <th className="py-2 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchData.map((b: any) => (
                        <tr key={b.name} className="border-b last:border-0">
                          <td className="py-2 font-medium">
                            {b.name}{' '}
                            <span className="text-muted-foreground font-mono">
                              ({b.branchCode})
                            </span>
                          </td>
                          <td className="py-2 text-right font-mono font-semibold">
                            {Number(b.users || 0).toLocaleString()}
                          </td>
                          <td className="py-2 text-right font-mono text-emerald-600">
                            {Number(b.activeUsers || 0).toLocaleString()}
                          </td>
                          <td className="py-2 text-right font-mono">{b.value}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
