'use client';

import { useState, useEffect, useCallback } from 'react';
import { DatabaseZap, PlusCircle, Download, RotateCcw, Trash2, Loader2, CheckCircle, XCircle, Clock, ShieldCheck, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BackupRecord {
  id: string;
  label: string;
  description: string | null;
  backupType: string;
  database: string;
  status: string;
  filePath: string | null;
  fileSize: number | null;
  checksum: string | null;
  createdBy: string;
  restoredAt: string | null;
  restoredBy: string | null;
  createdAt: string;
}

const STATUS_CFG: Record<string, { color: string; icon: any; bg: string }> = {
  Completed:  { color: 'text-green-700',  icon: CheckCircle, bg: 'bg-green-100 border-green-300' },
  InProgress: { color: 'text-amber-700',  icon: Loader2,     bg: 'bg-amber-100 border-amber-300' },
  Failed:     { color: 'text-red-700',    icon: XCircle,     bg: 'bg-red-100 border-red-300' },
};

function formatSize(kb: number | null) {
  if (!kb) return '—';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function BackupPage() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackupRecord | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<BackupRecord | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [form, setForm] = useState({ label: '', description: '', backupType: 'Full' });

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/backup', { cache: 'no-store' });
      if (res.ok) setBackups(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBackups(); }, [fetchBackups]);

  const totalSize = backups.reduce((a, b) => a + (b.fileSize || 0), 0);
  const lastBackup = backups.find(b => b.status === 'Completed');

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form), cache: 'no-store',
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      toast({ title: 'Backup Created', description: 'Database snapshot saved successfully.' });
      setCreateOpen(false);
      setForm({ label: '', description: '', backupType: 'Full' });
      await fetchBackups();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const handleDownload = async (backup: BackupRecord) => {
    try {
      const res = await fetch(`/api/settings/backup/${backup.id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.label.replace(/\s+/g, '-')}-${new Date(backup.createdAt).toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/settings/backup/${restoreTarget.id}`, { method: 'PUT', cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json()).message || 'Restore failed');
      toast({ title: 'Restore Complete', description: 'Database restored from backup successfully.' });
      setRestoreTarget(null);
      await fetchBackups();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setRestoring(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch('/api/settings/backup', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      toast({ title: 'Deleted', description: 'Backup removed.' });
      setDeleteTarget(null);
      await fetchBackups();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(222,47%,25%) 0%, hsl(222,47%,14%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
              <DatabaseZap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Backup &amp; Restore</h1>
              <p className="text-white/60 text-sm mt-0.5">Create exportable, timestamped snapshots of the PostgreSQL dashboard database</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Backup
          </Button>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Backups', value: backups.length },
            { label: 'Last Backup', value: lastBackup ? new Date(lastBackup.createdAt).toLocaleDateString() : '—' },
            { label: 'Total Size', value: formatSize(totalSize) },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Backup format:</strong> JSON snapshot with SHA-256 checksum. Each backup captures Users, Roles, Branches, Schools, Security Policies, IP Whitelist, and IPS Banks/Wallets. Backups are stored in <code className="bg-blue-100 px-1 rounded font-mono text-xs">public/backups/</code>.
        </div>
      </div>

      {/* Backup list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : backups.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No backups yet</p>
          <p className="text-sm mt-1">Click &ldquo;Create Backup&rdquo; to create your first snapshot.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map(backup => {
            const cfg = STATUS_CFG[backup.status] || STATUS_CFG.Failed;
            const StatusIcon = cfg.icon;
            return (
              <div key={backup.id} className="group flex items-start gap-4 rounded-2xl p-5 transition-all hover:shadow-md glass-card">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{backup.label}</p>
                    <Badge variant="outline" className="text-[10px]">{backup.backupType}</Badge>
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.bg, cfg.color)}>
                      <StatusIcon className={cn('h-3 w-3', backup.status === 'InProgress' && 'animate-spin')} />
                      {backup.status}
                    </span>
                  </div>
                  {backup.description && <p className="text-xs text-muted-foreground mt-0.5">{backup.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span>📅 {new Date(backup.createdAt).toLocaleString()}</span>
                    <span>💾 {formatSize(backup.fileSize)}</span>
                    <span>👤 {backup.createdBy}</span>
                    {backup.restoredAt && <span className="text-green-600">✓ Restored {new Date(backup.restoredAt).toLocaleDateString()}</span>}
                    {backup.checksum && <span className="font-mono truncate max-w-[120px]" title={backup.checksum}>SHA256: {backup.checksum.slice(0, 8)}…</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {backup.status === 'Completed' && (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-blue-600 hover:bg-blue-50" onClick={() => handleDownload(backup)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-amber-600 hover:bg-amber-50" onClick={() => setRestoreTarget(backup)}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(backup)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Database Backup</DialogTitle>
            <DialogDescription>Creates a full JSON snapshot of the dash_module PostgreSQL database with SHA-256 checksum and timestamp.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Backup Label</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder={`Backup ${new Date().toLocaleDateString()}`} />
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="e.g. Pre-deployment backup" />
            </div>
            <div className="space-y-1.5">
              <Label>Backup Type</Label>
              <Select value={form.backupType} onValueChange={v => setForm(f => ({ ...f, backupType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full">Full — All tables</SelectItem>
                  <SelectItem value="Partial">Partial — Config only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <strong>Target:</strong> dash_module (PostgreSQL)<br />
              <strong>Tables:</strong> Users, Roles, Branches, Schools, Security, IP Whitelist, IPS Banks/Wallets
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><DatabaseZap className="mr-2 h-4 w-4" /> Create Backup</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirm */}
      <AlertDialog open={!!restoreTarget} onOpenChange={open => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore from Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite current Roles, Schools, and IP Whitelist data with the snapshot from <strong>&ldquo;{restoreTarget?.label}&rdquo;</strong> ({new Date(restoreTarget?.createdAt || 0).toLocaleString()}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={restoring} className="bg-amber-600 hover:bg-amber-700">
              {restoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Restore Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the backup file and record for &ldquo;{deleteTarget?.label}&rdquo;. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
