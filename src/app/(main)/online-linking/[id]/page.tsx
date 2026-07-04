'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, User, Phone, MapPin, FileText, AlertTriangle, Video, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  action: string;
  notes: string | null;
  reviewedAt: string;
}

interface Application {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  nationalId: string | null;
  phone: string;
  email: string | null;
  homeBranch: string;
  faydaVerified: boolean;
  faydaData: string | null;
  livenessCheckPassed: boolean;
  videoUrl: string | null;
  videoWord: string | null;
  signatureUrl: string | null;
  accountNumber: string | null;
  accountType: string | null;
  status: string;
  submittedAt: string;
  rejectionReason: string | null;
  reviews: Review[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Verified: 'bg-blue-100 text-blue-700 border-blue-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-muted/40 border-b">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DataRow({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-xs font-medium', mono && 'font-mono bg-muted px-1.5 py-0.5 rounded')}>{value || '—'}</span>
    </div>
  );
}

function VerifyBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn('flex items-center gap-2 p-3 rounded-xl border', ok ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200')}>
      {ok ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> : <XCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      <span className={cn('text-xs font-semibold', ok ? 'text-green-700' : 'text-slate-500')}>{label}</span>
    </div>
  );
}

export default function OnlineLinkingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchApp = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/online-linking/applications/${params.id}`, { cache: 'no-store' });
      if (res.ok) setApp(await res.json());
      else toast({ title: 'Error', description: 'Application not found', variant: 'destructive' });
    } catch {
      toast({ title: 'Error', description: 'Failed to load application', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const takeAction = async (action: string, newStatus: string) => {
    if (newStatus === 'Rejected' && !notes.trim()) {
      toast({ title: 'Required', description: 'Please enter a rejection reason.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/online-linking/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: params.id, action, notes, status: newStatus }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Updated', description: `Application marked as ${newStatus}.` });
      setNotes('');
      await fetchApp();
    } catch {
      toast({ title: 'Error', description: 'Failed to update application', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!app) return <div className="text-center py-24 text-muted-foreground">Application not found.</div>;

  const faydaParsed = app.faydaData ? (() => { try { return JSON.parse(app.faydaData!); } catch { return null; } })() : null;
  const canAct = app.status === 'Pending' || app.status === 'Verified';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(158,64%,30%) 0%, hsl(158,64%,20%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => router.back()}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl mb-3 -ml-1">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Applications
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{app.fullName}</h1>
              <p className="text-white/60 text-sm mt-0.5">Application ID: <code className="font-mono">{app.id}</code></p>
            </div>
            <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border', STATUS_COLORS[app.status])}>
              {app.status}
            </span>
          </div>
          {app.rejectionReason && (
            <div className="mt-3 flex items-start gap-2 bg-red-500/20 rounded-xl px-3 py-2 border border-red-400/30">
              <AlertTriangle className="h-4 w-4 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-200"><strong>Rejection Reason:</strong> {app.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — personal info + verification */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Personal Information" icon={User}>
            <div className="space-y-0">
              <DataRow label="Full Name" value={app.fullName} />
              <DataRow label="Date of Birth" value={app.dateOfBirth} />
              <DataRow label="Phone Number" value={app.phone} mono />
              <DataRow label="Email Address" value={app.email} />
              <DataRow label="National ID (Fayda)" value={app.nationalId} mono />
              <DataRow label="Home Branch" value={app.homeBranch} />
              <DataRow label="Submitted" value={new Date(app.submittedAt).toLocaleString()} />
            </div>
          </Section>

          {app.accountNumber && (
            <Section title="Account Linking" icon={FileText}>
              <DataRow label="Account Number" value={app.accountNumber} mono />
              <DataRow label="Account Type" value={app.accountType} />
            </Section>
          )}

          {faydaParsed && (
            <Section title="Fayda Verification Data" icon={FileText}>
              <div className="space-y-0">
                {Object.entries(faydaParsed).map(([k, v]) => (
                  <DataRow key={k} label={k} value={String(v)} />
                ))}
              </div>
            </Section>
          )}

          {/* Review History */}
          {app.reviews.length > 0 && (
            <Section title="Review History" icon={Clock}>
              <div className="space-y-3">
                {app.reviews.map(r => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                      {r.reviewerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">{r.reviewerName}</p>
                        <span className="text-[10px] text-muted-foreground">{new Date(r.reviewedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">Action: <strong>{r.action.replace(/-/g, ' ')}</strong></p>
                      {r.notes && <p className="text-xs mt-1 text-foreground/80 italic">&quot;{r.notes}&quot;</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right column — verification checks + action panel */}
        <div className="space-y-4">
          <Section title="Verification Checklist" icon={CheckCircle}>
            <div className="space-y-2">
              <VerifyBadge ok={app.faydaVerified} label="Fayda ID Verified" />
              <VerifyBadge ok={app.livenessCheckPassed} label="Liveness Check Passed" />
              <VerifyBadge ok={!!app.signatureUrl} label="Signature Captured" />
              <VerifyBadge ok={!!app.videoUrl} label="Video Recorded" />
              <VerifyBadge ok={!!app.accountNumber} label="Account Linked" />
            </div>
          </Section>

          {app.videoUrl && (
            <Section title="Video Recording" icon={Video}>
              <p className="text-xs text-muted-foreground mb-2">Word spoken: <strong>{app.videoWord || '—'}</strong></p>
              <a href={app.videoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline">
                <Video className="h-3.5 w-3.5" /> Watch Recording
              </a>
            </Section>
          )}

          {app.signatureUrl && (
            <Section title="Signature" icon={PenTool}>
              <img src={app.signatureUrl} alt="Customer Signature" className="w-full rounded-lg border bg-white p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </Section>
          )}

          {/* Action Panel */}
          {canAct && (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 bg-primary/5 border-b">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Take Action</h3>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Notes / Reason <span className="text-muted-foreground">(required for rejection)</span></Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder="Enter review notes or rejection reason..." className="text-sm" />
                </div>
                <div className="space-y-2">
                  {app.status === 'Pending' && (
                    <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={saving} onClick={() => takeAction('verified', 'Verified')}>
                      {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                      <CheckCircle className="mr-2 h-4 w-4" /> Verify Application
                    </Button>
                  )}
                  {app.status === 'Verified' && (
                    <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white"
                      disabled={saving} onClick={() => takeAction('approved', 'Approved')}>
                      {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve Application
                    </Button>
                  )}
                  <Button variant="outline" className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                    disabled={saving} onClick={() => takeAction('rejected', 'Rejected')}>
                    {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    <XCircle className="mr-2 h-4 w-4" /> Reject Application
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!canAct && (
            <div className={cn('rounded-2xl border p-4 text-center', STATUS_COLORS[app.status])}>
              <p className="text-sm font-semibold">Application {app.status}</p>
              <p className="text-xs mt-1 opacity-70">No further action required.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
