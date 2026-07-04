'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Search, Loader2, Clock, CheckCircle, XCircle, Eye, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  fullName: string;
  phone: string;
  nationalId: string | null;
  homeBranch: string;
  status: string;
  faydaVerified: boolean;
  livenessCheckPassed: boolean;
  submittedAt: string;
  reviews: { action: string; reviewedAt: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  Pending:     { label: 'Pending',      color: 'text-amber-700',  icon: Clock,        bg: 'bg-amber-50 border-amber-200' },
  UnderReview: { label: 'Under Review', color: 'text-blue-700',   icon: Eye,          bg: 'bg-blue-50 border-blue-200' },
  Approved:    { label: 'Approved',     color: 'text-green-700',  icon: CheckCircle,  bg: 'bg-green-50 border-green-200' },
  Rejected:    { label: 'Rejected',     color: 'text-red-700',    icon: XCircle,      bg: 'bg-red-50 border-red-200' },
};

function maskId(id: string | null) {
  if (!id) return '—';
  return id.length > 6 ? id.slice(0, 3) + '•••' + id.slice(-3) : '•••';
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function OnlineOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const statusParam = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState(statusParam || 'All');
  
  useEffect(() => {
    setStatusFilter(statusParam || 'All');
  }, [statusParam]);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'All' ? `/api/online-linking/applications?status=${statusFilter}` : '/api/online-linking/applications';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) setApps(await res.json());
    } catch {
      toast({ title: 'Error', description: 'Failed to load applications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const filtered = useMemo(() => {
    if (!search) return apps;
    const t = search.toLowerCase();
    return apps.filter(a => a.fullName.toLowerCase().includes(t) || a.phone.includes(t) || (a.nationalId || '').includes(t));
  }, [apps, search]);

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter(a => a.status === 'Pending').length,
    underReview: apps.filter(a => a.status === 'UnderReview').length,
    approved: apps.filter(a => a.status === 'Approved').length,
    rejected: apps.filter(a => a.status === 'Rejected').length,
  }), [apps]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(158,64%,35%) 0%, hsl(158,64%,25%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-8 bottom-0 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Online Linking</h1>
            <p className="text-white/70 text-sm mt-0.5">Review and approve mobile account linking applications</p>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-300' },
            { label: 'Under Review', value: stats.underReview, color: 'text-blue-300' },
            { label: 'Approved', value: stats.approved, color: 'text-green-300' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-300' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 rounded-xl" placeholder="Search by name, phone, or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="UnderReview">Under Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Application cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">{search ? 'No applications match your search' : 'No applications found'}</p>
          <p className="text-sm mt-1">Applications submitted via the mobile app will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={app.id}
                className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                onClick={() => router.push(`/online-linking/${app.id}`)}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top right, hsl(158,64%,35%/0.05), transparent 70%)' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{app.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.phone}</p>
                    </div>
                    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ml-2', cfg.bg, cfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">National ID</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{maskId(app.nationalId)}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Home Branch</span>
                      <span className="font-medium">{app.homeBranch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted</span>
                      <span>{timeAgo(app.submittedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', app.faydaVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                      {app.faydaVerified ? '✓ Fayda' : '○ Fayda'}
                    </span>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', app.livenessCheckPassed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                      {app.livenessCheckPassed ? '✓ Liveness' : '○ Liveness'}
                    </span>
                  </div>
                </div>
                <div className="border-t px-5 py-2.5 bg-muted/20 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg gap-1">
                    <Eye className="h-3 w-3" /> Review
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
