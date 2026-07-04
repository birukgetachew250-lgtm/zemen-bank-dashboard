'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LayoutGrid, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OnlineLinkingOverview() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/online-linking/applications');
        if (res.ok) {
          const apps = await res.json();
          setStats({
            total: apps.length,
            pending: apps.filter((a: any) => a.status === 'Pending').length,
            verified: apps.filter((a: any) => a.status === 'Verified').length,
            approved: apps.filter((a: any) => a.status === 'Approved').length,
            rejected: apps.filter((a: any) => a.status === 'Rejected').length,
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load stats', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [toast]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(158,64%,35%) 0%, hsl(158,64%,25%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Online Linking Overview</h1>
            <p className="text-white/70 text-sm mt-0.5">High-level reporting and statistics for account linking</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-amber-200/50 bg-amber-50/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-200/50 bg-green-50/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-200/50 bg-red-50/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
