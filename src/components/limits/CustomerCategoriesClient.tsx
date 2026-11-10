'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle,
  Trash2,
  Loader2,
  Edit,
  Search,
  Upload,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  Tags,
  Sparkles,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/app/(main)/limits/categories/page';

interface CustomerCategoriesClientProps {
  initialItems: Category[];
}

export function CustomerCategoriesClient({
  initialItems,
}: CustomerCategoriesClientProps) {
  const [items, setItems] = useState<Category[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Category[] | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | null>(null);

  // Inline Create/Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        (item.code || '').toLowerCase().includes(term) ||
        (item.name || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', description: '' });
    setIsFormOpen(true);
  };

  const openEditModal = (item: Category) => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
    });
    setIsFormOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Category Code and Name are required.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = !!editingItem;
      const payload = isEdit
        ? { id: editingItem.id, code: formData.code.trim(), name: formData.name.trim(), description: formData.description.trim() }
        : { code: formData.code.trim(), name: formData.name.trim(), description: formData.description.trim() };

      const res = await fetch('/api/limits/customer-categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to save category');
      }

      if (isEdit) {
        setItems((prev) =>
          prev
            .map((i) => (i.id === editingItem.id ? { ...i, ...result } : i))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast({ title: 'Category Updated', description: `"${result.name}" has been updated.` });
      } else {
        setItems((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: 'Category Created', description: `"${result.name}" has been added.` });
      }

      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/limits/customer-categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      if (res.status !== 204) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete');
      }

      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      toast({ title: 'Deleted', description: 'Customer category removed.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    try {
      const { read, utils } = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = utils.sheet_to_json(worksheet, { defval: '' });

      const parsed: Category[] = rows
        .filter((row) => row.Code || row.code)
        .map((row) => ({
          id: '',
          code: String(row.Code || row.code || '').trim(),
          name: String(row.Name || row.name || '').trim(),
          description: String(row.Description || row.description || '').trim(),
        }))
        .filter((row) => row.code && row.name);

      if (parsed.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No valid rows',
          description: 'Ensure columns: Code, Name, Description',
        });
        return;
      }

      setImportPreview(parsed);
      setIsImportDialogOpen(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to read Excel file.' });
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);

    try {
      const res = await fetch('/api/limits/customer-categories/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importPreview }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to import categories');
      }

      const added = result.created as Category[];
      setItems((prev) => [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: 'Import successful', description: `${added.length} categories imported.` });
      setIsImportDialogOpen(false);
      setImportPreview(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Import failed', description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(85% 140% at 100% 0%, hsl(347 77% 42% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(215 80% 45% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-rose-200 backdrop-blur-sm">
              <Tags className="h-3.5 w-3.5" /> Segmentation &amp; Tiering
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Customer Categories</h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Define customer segmentation tiers (Retail, Gold, Platinum, Corporate, Diaspora, Staff) used to bind transaction limits and fee rules across the SuperApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button
              onClick={openCreateModal}
              className="rounded-xl bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-200">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Total Categories</p>
              <p className="text-xl font-bold">{items.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">With Descriptions</p>
              <p className="text-xl font-bold">{items.filter((i) => i.description?.trim()).length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Filtered Results</p>
              <p className="text-xl font-bold">{filteredItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Card */}
      <Card className="border-border/70 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 border-b pb-4">
          <div>
            <CardTitle className="text-lg">Registered Customer Segments</CardTitle>
            <CardDescription>Search by category code, name, or description.</CardDescription>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code, name, or description..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[180px] pl-6">Category Code</TableHead>
                  <TableHead className="w-[260px]">Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right pr-6 w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No customer categories found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6">
                        <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 bg-primary/5 border-primary/20 text-primary">
                          {item.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.description || <span className="italic text-muted-foreground/60">No description provided</span>}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Quick Edit"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Category"
                            onClick={() => setItemToDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Category Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingItem ? 'Edit Customer Category' : 'Add Customer Category'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update the code, display name, or description for this customer segment.'
                : 'Create a new customer segment for transaction limits and fee schedules.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category Code <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. RETAIL_STD or CORP_VIP"
                className="font-mono uppercase"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
              <p className="text-[11px] text-muted-foreground">Unique identifier code synced with Core Banking / Limit Engine.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Category Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Retail Standard Customer"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Describe eligibility criteria or segment notes..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Import Preview Modal */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excel Import Preview ({importPreview?.length ?? 0} rows)</DialogTitle>
            <DialogDescription>
              Review the parsed customer categories below. Duplicate codes will be skipped automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border overflow-x-auto max-h-[45vh]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importPreview?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{row.code}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category <strong>&quot;{itemToDelete?.name}&quot;</strong> ({itemToDelete?.code}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
