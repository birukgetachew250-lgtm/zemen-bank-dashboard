'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  Hash,
  FileText,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface AccountClassPermissionItem {
  id: string;
  accountClass: string;
  description: string;
  accountCode: string;
  canView: boolean;
  canDebit: boolean;
  isActive: boolean;
  insertDate: string | null;
  updateDate: string | null;
  insertUser: string;
  updateUser: string;
  linkedAccountsCount?: number;
}

interface FormState {
  id?: string;
  accountClass: string;
  accountCode: string;
  description: string;
  canView: boolean;
  canDebit: boolean;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  accountClass: '',
  accountCode: '',
  description: '',
  canView: true,
  canDebit: false,
  isActive: true,
};

export function AccountClassPermissionsClient({
  initialItems = [],
}: {
  initialItems?: AccountClassPermissionItem[];
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<AccountClassPermissionItem[]>(initialItems);
  const [loading, setLoading] = useState<boolean>(initialItems.length === 0);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'debit' | 'view-only' | 'inactive'>('all');

  // Create / Edit Dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Quick toggle saving state per row ID
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AccountClassPermissionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/account-class-permissions?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to load Account Class Permissions');
      }
      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading permissions',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const stats = useMemo(() => {
    const total = items.length;
    const debitCount = items.filter((i) => i.canDebit && i.isActive).length;
    const viewOnlyCount = items.filter((i) => i.canView && !i.canDebit && i.isActive).length;
    const activeCount = items.filter((i) => i.isActive).length;
    return { total, debitCount, viewOnlyCount, activeCount };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filterMode === 'debit' && !(item.canDebit && item.isActive)) return false;
      if (filterMode === 'view-only' && !(item.canView && !item.canDebit && item.isActive)) return false;
      if (filterMode === 'inactive' && item.isActive) return false;

      if (!q) return true;
      return (
        item.accountClass.toLowerCase().includes(q) ||
        item.accountCode.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [items, search, filterMode]);

  const openCreateModal = () => {
    setIsEditing(false);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (item: AccountClassPermissionItem) => {
    setIsEditing(true);
    setForm({
      id: item.id,
      accountClass: item.accountClass,
      accountCode: item.accountCode,
      description: item.description,
      canView: item.canView,
      canDebit: item.canDebit,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountClass.trim() || !form.accountCode.trim() || !form.description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Account Class, Account Code, and Description are all required.',
      });
      return;
    }

    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/account-class-permissions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          accountClass: form.accountClass.trim().toUpperCase(),
          accountCode: form.accountCode.trim(),
          description: form.description.trim(),
          canView: form.canView,
          canDebit: form.canDebit,
          isActive: form.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to save Account Class Permission.');
      }

      toast({
        title: isEditing ? 'Account Class Updated' : 'Account Class Created',
        description: json.message,
      });
      setModalOpen(false);
      await fetchPermissions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInlineToggle = async (
    item: AccountClassPermissionItem,
    field: 'canView' | 'canDebit' | 'isActive',
    nextVal: boolean
  ) => {
    setTogglingId(item.id);
    const updated: AccountClassPermissionItem = {
      ...item,
      [field]: nextVal,
      // If enabling CanDebit, ensure CanView is also enabled
      ...(field === 'canDebit' && nextVal ? { canView: true } : {}),
    };

    try {
      const res = await fetch('/api/account-class-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update permission flag.');
      }

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? { ...updated, updateDate: new Date().toISOString() }
            : row
        )
      );
      toast({
        title: `${item.accountClass} Updated`,
        description: `Permission updated successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/account-class-permissions?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to delete Account Class Permission.');
      }
      toast({
        title: 'Account Class Removed',
        description: `"${deleteTarget.accountClass}" has been deleted.`,
      });
      setDeleteTarget(null);
      await fetchPermissions();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 md:p-8 text-white shadow-xl border border-white/10"
        style={{
          background:
            'radial-gradient(85% 140% at 100% 0%, hsl(205 85% 42% / 0.5), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 77% 40% / 0.4), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))',
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              USER_MODULE.AccountClassPermissions
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Account Class Permissions
            </h1>
            <p className="text-sm text-white/75">
              Configure FlexCube Account Classes (<code className="text-sky-200 font-mono">CESB</code>,{' '}
              <code className="text-sky-200 font-mono">SPRI</code>,{' '}
              <code className="text-sky-200 font-mono">FCCA</code>) and control whether accounts are{' '}
              <span className="font-semibold text-amber-300">View Only (Dashboard)</span> or{' '}
              <span className="font-semibold text-sky-300">From Account (Debit / Outgoing Transfer Enabled)</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchPermissions}
              disabled={loading}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              onClick={openCreateModal}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account Class
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs text-white/60">Total Account Classes</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-sky-400/30 bg-sky-500/15 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-sky-200">From Account (Can Debit)</p>
              <span className="h-2.5 w-2.5 rounded-full bg-[#0070C0] ring-2 ring-sky-300/50" />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{stats.debitCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/15 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-200">View Only (Card / Dashboard)</p>
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFFF00] ring-2 ring-amber-300/50" />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{stats.viewOnlyCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs text-emerald-200">Active Classes</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.activeCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Configured Account Classes</CardTitle>
              <CardDescription>
                Manage viewing and outgoing debit permissions per core banking Account Class and Account Code.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: `All (${items.length})` },
                  { id: 'debit', label: `From Account / Can Debit (${stats.debitCount})` },
                  { id: 'view-only', label: `View Only (${stats.viewOnlyCount})` },
                  { id: 'inactive', label: `Inactive (${items.length - stats.activeCount})` },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={filterMode === tab.id ? 'default' : 'outline'}
                  onClick={() => setFilterMode(tab.id)}
                  className="rounded-xl text-xs"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Account Class (e.g. CESB), Code (e.g. 117), or description..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[130px]">Account Class</TableHead>
                  <TableHead className="w-[120px]">Account Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[220px]">Permission Tier</TableHead>
                  <TableHead className="text-center w-[110px]">Can View</TableHead>
                  <TableHead className="text-center w-[110px]">Can Debit</TableHead>
                  <TableHead className="text-center w-[100px]">Active</TableHead>
                  <TableHead className="text-center w-[120px]">Linked Accts</TableHead>
                  <TableHead className="text-right w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-36 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span>Loading Account Class Permissions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-36 text-center text-muted-foreground">
                      No Account Class Permissions found matching your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isBusy = togglingId === item.id;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(!item.isActive && 'opacity-60 bg-muted/20')}
                      >
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white dark:bg-slate-800">
                            <Layers className="h-3 w-3 text-primary" />
                            {item.accountClass}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            #{item.accountCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{item.description}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Updated by {item.updateUser}
                            {item.updateDate
                              ? ` • ${new Date(item.updateDate).toLocaleDateString()}`
                              : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.canDebit ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-[#0070C0]/15 px-3 py-1 text-xs font-semibold text-[#0070C0] dark:text-sky-300">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              From Account (Debit)
                            </span>
                          ) : item.canView ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
                              <Eye className="h-3.5 w-3.5" />
                              View Only (Card)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
                              <XCircle className="h-3.5 w-3.5" />
                              Hidden / No Access
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={item.canView}
                            disabled={isBusy}
                            onCheckedChange={(val) => handleInlineToggle(item, 'canView', val)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={item.canDebit}
                            disabled={isBusy}
                            onCheckedChange={(val) => handleInlineToggle(item, 'canDebit', val)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={item.isActive}
                            disabled={isBusy}
                            onCheckedChange={(val) => handleInlineToggle(item, 'isActive', val)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {(item.linkedAccountsCount ?? 0).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(item)}
                              title="Edit Account Class"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(item)}
                              className="text-destructive hover:text-destructive"
                              title="Delete Account Class"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Account Class Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit Account Class — ${form.accountClass}` : 'Add Account Class Permission'}
            </DialogTitle>
            <DialogDescription>
              Configure the core banking Account Class code, Account Code, and mobile banking permission flags in{' '}
              <code className="font-mono text-xs">USER_MODULE.AccountClassPermissions</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="accountClass" className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Account Class *
                </Label>
                <Input
                  id="accountClass"
                  value={form.accountClass}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountClass: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. CESB, SPRI, FCCA"
                  maxLength={20}
                  className="font-mono uppercase"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Unique core banking class code (max 20 chars)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accountCode" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  Account Code *
                </Label>
                <Input
                  id="accountCode"
                  value={form.accountCode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountCode: e.target.value,
                    }))
                  }
                  placeholder="e.g. 117, 11, 79"
                  maxLength={20}
                  className="font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Core banking numeric/code identifier
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Description *
              </Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="e.g. Personal Saving Account - Zemen Club"
                maxLength={250}
                required
              />
            </div>

            {/* Permission Switches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                <div className="space-y-0.5 pr-4">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFFF00] ring-1 ring-amber-500" />
                    Can View (On Card / Dashboard)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allows the customer to see balances and statements for this account class on the app dashboard.
                  </p>
                </div>
                <Switch
                  checked={form.canView}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      canView: checked,
                      ...(checked ? {} : { canDebit: false }),
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/5 p-3.5">
                <div className="space-y-0.5 pr-4">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0070C0] ring-1 ring-sky-500" />
                    Can Debit (From Account / Outgoing Transfers)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allows this account class to be debited as a source (&quot;From Account&quot;) for transfers and bill payments.
                  </p>
                </div>
                <Switch
                  checked={form.canDebit}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      canDebit: checked,
                      ...(checked ? { canView: true } : {}),
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3.5">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold">Active Status (IsActive)</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive account classes are disabled from active permission evaluation.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Account Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Account Class &ldquo;{deleteTarget?.accountClass}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-mono font-semibold text-foreground">
                {deleteTarget?.accountClass}
              </span>{' '}
              ({deleteTarget?.description}) from{' '}
              <code className="text-xs font-mono">USER_MODULE.AccountClassPermissions</code>.
              {(deleteTarget?.linkedAccountsCount ?? 0) > 0 && (
                <span className="mt-2 block rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                  Warning: {deleteTarget?.linkedAccountsCount} linked customer account(s) currently reference this Account Class.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
