'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusCircle, Search, Edit, Trash2, Loader2, BookOpen, ImageIcon, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SchoolRecord {
  id: string;
  schoolName: string;
  schoolImage: string | null;
  schoolExternalId: string;
  schoolFlexAccount: string;
  schoolProductId: string;
  status: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = {
  schoolName: '',
  schoolImage: '',
  schoolExternalId: '',
  schoolFlexAccount: '',
  schoolProductId: '',
  status: 'Active',
  description: '',
};

export default function SchoolsPage() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolRecord | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schools', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSchools(Array.isArray(data) ? data : []);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load schools', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const filtered = useMemo(() => {
    if (!searchTerm) return schools;
    const t = searchTerm.toLowerCase();
    return schools.filter(s =>
      s.schoolName.toLowerCase().includes(t) ||
      s.schoolExternalId.toLowerCase().includes(t) ||
      s.schoolFlexAccount.toLowerCase().includes(t)
    );
  }, [schools, searchTerm]);

  const openAdd = () => {
    setEditingSchool(null);
    setFormData({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (school: SchoolRecord) => {
    setEditingSchool(school);
    setFormData({
      schoolName: school.schoolName,
      schoolImage: school.schoolImage || '',
      schoolExternalId: school.schoolExternalId,
      schoolFlexAccount: school.schoolFlexAccount,
      schoolProductId: school.schoolProductId,
      status: school.status,
      description: school.description || '',
    });
    setDialogOpen(true);
  };

  const set = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const { schoolName, schoolExternalId, schoolFlexAccount, schoolProductId } = formData;
    if (!schoolName || !schoolExternalId || !schoolFlexAccount || !schoolProductId) {
      toast({ title: 'Validation Error', description: 'Name, School ID, Flex Account, and Product ID are required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const method = editingSchool ? 'PUT' : 'POST';
      const payload = editingSchool ? { id: editingSchool.id, ...formData } : formData;
      const res = await fetch('/api/schools', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save');
      }
      toast({ title: editingSchool ? 'Updated' : 'Created', description: `School "${formData.schoolName}" ${editingSchool ? 'updated' : 'added'} successfully.` });
      setDialogOpen(false);
      await fetchSchools();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch('/api/schools', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      toast({ title: 'Deleted', description: `"${deleteTarget.schoolName}" removed.` });
      setDeleteTarget(null);
      await fetchSchools();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, hsl(233,55%,52%) 0%, hsl(233,55%,40%) 100%)' }}>
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">School Management</h1>
              <p className="text-white/70 text-sm mt-0.5">Manage schools for fee payment — link school IDs to FlexCube accounts</p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-white text-[hsl(233,55%,52%)] hover:bg-white/90 font-semibold shadow-lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add School
          </Button>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Schools', value: schools.length },
            { label: 'Active', value: schools.filter(s => s.status === 'Active').length },
            { label: 'Inactive', value: schools.filter(s => s.status !== 'Active').length },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 rounded-xl"
          placeholder="Search by name, ID, or account..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── Grid / Table ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{searchTerm ? 'No schools match your search' : 'No schools added yet'}</p>
          {!searchTerm && <p className="text-sm mt-1">Click "Add School" to get started.</p>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(school => (
            <div
              key={school.id}
              className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Card accent glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, hsl(233,55%,52%/0.06), transparent 70%)' }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-border bg-muted flex items-center justify-center flex-shrink-0">
                    {school.schoolImage ? (
                      <img
                        src={school.schoolImage}
                        alt={school.schoolName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  {/* Status */}
                  <Badge className={cn(
                    'text-[10px] font-semibold',
                    school.status === 'Active'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {school.status === 'Active' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                    {school.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-foreground text-base leading-tight">{school.schoolName}</h3>
                {school.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{school.description}</p>
                )}

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">School ID</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">{school.schoolExternalId}</code>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Flex Account</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">{school.schoolFlexAccount}</code>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Product ID</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">{school.schoolProductId}</code>
                  </div>
                </div>
              </div>

              {/* Actions bar */}
              <div className="border-t px-5 py-2.5 flex justify-end gap-1 bg-muted/20">
                <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg" onClick={() => openEdit(school)}>
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(school)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
            <DialogDescription>
              {editingSchool
                ? 'Update school details and account mappings.'
                : 'Register a school to allow students to pay fees through the app.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>School Name <span className="text-red-500">*</span></Label>
              <Input value={formData.schoolName} onChange={e => set('schoolName', e.target.value)} placeholder="e.g. Addis Ababa University" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>School ID <span className="text-red-500">*</span></Label>
                <Input className="font-mono" value={formData.schoolExternalId} onChange={e => set('schoolExternalId', e.target.value)} placeholder="SCHOOL-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Product ID <span className="text-red-500">*</span></Label>
                <Input className="font-mono" value={formData.schoolProductId} onChange={e => set('schoolProductId', e.target.value)} placeholder="PROD-001" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>FlexCube Holding Account <span className="text-red-500">*</span></Label>
              <Input className="font-mono" value={formData.schoolFlexAccount} onChange={e => set('schoolFlexAccount', e.target.value)} placeholder="1234567890" />
            </div>
            <div className="space-y-1.5">
              <Label>School Image URL</Label>
              <Input type="url" value={formData.schoolImage} onChange={e => set('schoolImage', e.target.value)} placeholder="https://example.com/logo.png" />
              {formData.schoolImage && (
                <div className="mt-1 flex items-center gap-2">
                  <img src={formData.schoolImage} alt="Preview" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Optional notes..." />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSchool ? 'Update School' : 'Add School'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>"{deleteTarget?.schoolName}"</strong> from the system. Students will no longer be able to pay fees through this school.
            </AlertDialogDescription>
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
