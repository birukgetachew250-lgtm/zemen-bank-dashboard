'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Loader2, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataSourceBadge } from '@/components/reports/DemoDataBanner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialInclusionPage() {
  const [userData, setUserData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats/users', { cache: 'no-store' });
      if (res.ok) { const json = await res.json(); setUserData(json.data || []); setIsLive(json.isLive); }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derive branch distribution for pie chart from demo data
  const branchData = [
    { name: 'Addis Ababa', value: 45 },
    { name: 'Dire Dawa', value: 18 },
    { name: 'Hawassa', value: 12 },
    { name: 'Bahir Dar', value: 10 },
    { name: 'Others', value: 15 },
  ];

  const totalUsers = userData[userData.length - 1]?.totalUsers || 0;
  const totalNewUsers = userData.reduce((a: number, b: any) => a + (b.newUsers || 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(142,71%,38%) 0%, hsl(142,71%,25%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Financial Inclusion</h1>
                <DataSourceBadge isLive={isLive} />
              </div>
              <p className="text-white/60 text-sm mt-0.5">User growth, active accounts, and branch distribution metrics</p>
            </div>
          </div>
          <Button onClick={fetchData} disabled={loading} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl">
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} /> Refresh
          </Button>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: totalUsers.toLocaleString() },
            { label: 'New This Year', value: totalNewUsers.toLocaleString() },
            { label: 'Avg Monthly Growth', value: userData.length ? Math.round(totalNewUsers / userData.length).toLocaleString() : '—' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User growth area chart */}
          <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4">Monthly New User Registrations</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={userData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="newUsersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => v.toLocaleString()} />
                <Area type="monotone" dataKey="newUsers" stroke="#10b981" fill="url(#newUsersGrad)" strokeWidth={2} name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Branch distribution pie */}
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4">Users by Branch Region</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={branchData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                  {branchData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {branchData.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{b.name}</span>
                  </div>
                  <span className="font-semibold">{b.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active vs inactive bar */}
          <div className="lg:col-span-3 rounded-2xl border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4">Active vs Total Users — Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={userData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => v.toLocaleString()} />
                <Bar dataKey="activeUsers" fill="#3b82f6" radius={[4,4,0,0]} name="Active Users" />
                <Bar dataKey="newUsers" fill="#10b981" radius={[4,4,0,0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
