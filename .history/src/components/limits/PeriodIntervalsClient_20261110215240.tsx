'use client';

import { useState, useMemo } from 'react';
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
import {
  PlusCircle,
  Trash2,
  Loader2,
  Edit,
  Clock,
  CalendarRange,
  Search,
  Timer,
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
import type { Interval } from '@/app/(main)/limits/intervals/page';

interface PeriodIntervalsClientProps {
  initialItems: Interval[];
}

const QUICK_PRESETS = [
  { code: 'DAILY', name: 'Daily', days: '1' },
  { code: 'WEEKLY', name: 'Weekly', days: '7' },
  { code: 'MONTHLY', name: 'Monthly', days: '30' },
  { code: 'QUARTERLY', name: 'Quarterly', days: '90' },
  { code: 'ANNUAL', name: 'Annual', days: '365' },
];

export function PeriodIntervalsClient({
  initialItems,
}: PeriodIntervalsClientProps) {
  const [items, setItems] = useState<Interval[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Interval | null>(null);
  const [editingItem, setEditingItem] = useState<Interval | null>(null);
  const [newItem, setNewItem] = useState({ code: '', name: '', days: '' });
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (i) =>
        (i.code || '').toLowerCase().includes(term) ||
        (i.name || '').toLowerCase().includes(term) ||
        String(i.days).includes(term)
    );
  }, [items, searchTerm]);

  const openAddDialog = () => {
    setEditingItem(null);
    setNewItem({ code: '', name: '', days: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Interval) => {
    setEditingItem(item);
    setNewItem({ code: item.code || '', name: item.name || '', days: String(item.days ?? '') });
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!newItem.code.trim() || !newItem.name.trim() || !newItem.days) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Code, Name, and Days are required.',
      });
      return;
    }
    setIsSaving(true);
    const method = editingItem ? 'PUT' : 'POST';
    const payload = editingItem
      ? { id: editingItem.id, code: newItem.code.trim(), name: newItem.name.trim(), days: newItem.days }
      : { code: newItem.code.trim(), name: newItem.name.trim(), days: newItem.days };
    try {
      const res = await fetch('/api/limits/period-intervals', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      if (editingItem) {
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? result : i)).sort((a, b) => a.days - b.days));
        toast({ title: 'Interval Updated', description: `"${result.name}" has been updated.` });
      } else {
        setItems((prev) => [...prev, result].sort((a, b) => a.days - b.days));
        toast({ title: 'Interval Created', description: `"${result.name}" has been added.` });
      }
      setNewItem({ code: '', name: '', days: '' });
      setEditingItem(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/limits/period-intervals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      });
      if (res.status !== 204) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete');
      }
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      toast({ title: 'Deleted', description: 'Period interval removed.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  };

  const shortestDays = items.length ? Math.min(...items.map((i) => Number(i.days) || 0)) : 0;
  const longestDays = items.length ? Math.max(...items.map((i) => Number(i.days) || 0)) : 0;

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            'radial-gradient(85% 140% at 100% 0%, hsl(198 85% 42% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 77% 40% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-200 backdrop-blur-sm">
              <CalendarRange className="h-3.5 w-3.5" /> Time Window Definitions
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Period Intervals</h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Configure rolling and calendar duration windows (Daily, Weekly, Monthly, Annual) used by the Transaction Limit Engine to reset customer counters.
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="rounded-xl bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg w-fit"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Interval
          </Button>
        </div>

        {/* Summary KPI Strip */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Configured Intervals</p>
              <p className="text-xl font-bold">{items.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Shortest Window</p>
              <p className="text-xl font-bold">{shortestDays ? `${shortestDays} Day(s)` : '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Longest Window</p>
              <p className="text-xl font-bold">{longestDays ? `${longestDays} Day(s)` : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/70 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 border-b pb-4">
          <div>
            <CardTitle className="text-lg">Active Period Windows</CardTitle>
            <CardDescription>Sorted chronologically by window length in days.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-6 w-[200px]">Interval Code</TableHead>
                <TableHead>Interval Name</TableHead>
                <TableHead>Duration Window</TableHead>
                <TableHead className="text-right pr-6 w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No period intervals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6">
                      <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-sky-300">
                        {item.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {item.days} {Number(item.days) === 1 ? 'Day' : 'Days'} ({Number(item.days) * 24}h cycle)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} title="Edit Interval">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)} title="Delete Interval">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingItem ? 'Edit Period Interval' : 'Add Period Interval'}
            </DialogTitle>
            <DialogDescription>
              Define the interval code, display name, and reset duration in days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editingItem && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Quick Presets</Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((preset) => (
                    <Button
                      key={preset.code}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-lg"
                      onClick={() => setNewItem(preset)}
                    >
                      {preset.name} ({preset.days}d)
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Interval Code <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. DAILY, WEEKLY, MONTHLY"
                className="font-mono uppercase"
                value={newItem.code}
                onChange={(e) => setNewItem((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Display Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Daily"
                value={newItem.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Duration in Days <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 1, 7, 30"
                value={newItem.days}
                onChange={(e) => setNewItem((prev) => ({ ...prev, days: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Update Interval' : 'Create Interval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Period Interval?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the interval <strong>&quot;{itemToDelete?.name}&quot;</strong> ({itemToDelete?.days} days).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
