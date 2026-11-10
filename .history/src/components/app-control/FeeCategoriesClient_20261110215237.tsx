"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Trash2,
  Loader2,
  Edit,
  Search,
  Layers,
  CheckCircle2,
  Palette,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeeCategoryItem {
  CategoryId: string;
  CategoryName: string;
  CategoryCode: string;
  Description: string;
  IconUrl: string;
  ColorHex: string;
  Rank: number;
  Status: string;
}

function pickField(row: any, ...keys: string[]) {
  if (!row || typeof row !== "object") return undefined;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
    const foundKey = Object.keys(row).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return undefined;
}

export function normalizeFeeCategory(row: any): FeeCategoryItem {
  return {
    CategoryId: String(pickField(row, "CategoryId", "Id") ?? ""),
    CategoryName: String(pickField(row, "CategoryName", "Name") ?? ""),
    CategoryCode: String(pickField(row, "CategoryCode", "Code") ?? ""),
    Description: String(pickField(row, "Description") ?? ""),
    IconUrl: String(pickField(row, "IconUrl") ?? ""),
    ColorHex: String(pickField(row, "ColorHex") ?? "#10b981"),
    Rank: Number(pickField(row, "Rank") ?? 0),
    Status: String(pickField(row, "Status") ?? "Active"),
  };
}

const EMPTY_FORM = {
  CategoryName: "",
  CategoryCode: "",
  Description: "",
  IconUrl: "",
  ColorHex: "#10b981",
  Rank: "0",
  Status: "Active",
};

export default function FeeCategoriesClient() {
  const { toast } = useToast();
  const [items, setItems] = useState<FeeCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeCategoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FeeCategoryItem | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/app-control/fee-categories?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data.map(normalizeFeeCategory) : []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch Fee Categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.Status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.CategoryName.toLowerCase().includes(term) ||
        item.CategoryCode.toLowerCase().includes(term) ||
        item.Description.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm, statusFilter]);

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      ...EMPTY_FORM,
      Rank: String(items.length + 1),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: FeeCategoryItem) => {
    const normalized = normalizeFeeCategory(item);
    setEditingItem(normalized);
    setFormData({
      CategoryName: normalized.CategoryName || "",
      CategoryCode: normalized.CategoryCode || "",
      Description: normalized.Description || "",
      IconUrl: normalized.IconUrl || "",
      ColorHex: normalized.ColorHex || "#10b981",
      Rank: String(normalized.Rank ?? 0),
      Status: normalized.Status || "Active",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.CategoryName.trim() || !formData.CategoryCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Category Name and Category Code are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = !!editingItem;
      const payload = {
        ...(isEdit ? { CategoryId: editingItem.CategoryId } : {}),
        CategoryName: formData.CategoryName.trim(),
        CategoryCode: formData.CategoryCode.trim().toUpperCase(),
        Description: formData.Description.trim() || null,
        IconUrl: formData.IconUrl.trim() || null,
        ColorHex: formData.ColorHex || "#10b981",
        Rank: Number(formData.Rank) || 0,
        Status: formData.Status || "Active",
      };

      const res = await fetch("/api/app-control/fee-categories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save Fee Category");
      }

      toast({
        title: isEdit ? "Category Updated" : "Category Created",
        description: `"${formData.CategoryName}" saved successfully.`,
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch("/api/app-control/fee-categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CategoryId: itemToDelete.CategoryId }),
      });
      if (res.status !== 204 && !res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete failed");
      }
      toast({
        title: "Deleted",
        description: `Fee category "${itemToDelete.CategoryName}" deleted.`,
      });
      setItemToDelete(null);
      await fetchItems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const activeCount = items.filter((i) => i.Status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            "radial-gradient(85% 140% at 100% 0%, hsl(265 75% 45% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 77% 40% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))",
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-purple-200 backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" /> App Control · Fee Taxonomy
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Fee Categories
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Organize mobile banking fee schedules into clear functional categories (Transfers, Bill Payments, International Remittance, Card Services) displayed in the SuperApp tariff guide.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={fetchItems}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={openAddDialog}
              className="rounded-xl bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Fee Category
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-200">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Total Categories</p>
              <p className="text-xl font-bold">{items.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Active Categories</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Inactive / Draft</p>
              <p className="text-xl font-bold">{items.length - activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 border-b pb-4">
          <div>
            <CardTitle className="text-lg">Fee Category Directory</CardTitle>
            <CardDescription>Click Edit on any category to update its details, branding color, or rank.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-6 w-[80px]">Rank</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Brand Theme</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No fee categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.CategoryId} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                          #{item.Rank}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {item.CategoryName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs bg-primary/5 border-primary/20 text-primary">
                            {item.CategoryCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {item.Description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-4 w-4 rounded-full border shadow-sm shrink-0"
                              style={{ backgroundColor: item.ColorHex || "#10b981" }}
                            />
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.ColorHex || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              item.Status === "Active"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            {item.Status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                              title="Edit Fee Category"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setItemToDelete(item)}
                              title="Delete Fee Category"
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
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingItem ? "Edit Fee Category" : "Add Fee Category"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Editing category "${editingItem.CategoryName}" (${editingItem.CategoryCode}).`
                : "Create a new fee category to group transaction fee charges."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Category Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.CategoryName}
                onChange={(e) => setFormData((p) => ({ ...p, CategoryName: e.target.value }))}
                placeholder="e.g. Fund Transfers"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category Code <span className="text-red-500">*</span></Label>
              <Input
                className="font-mono uppercase"
                value={formData.CategoryCode}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, CategoryCode: e.target.value.toUpperCase() }))
                }
                placeholder="e.g. FUND_TRANSFER"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.Description}
                onChange={(e) => setFormData((p) => ({ ...p, Description: e.target.value }))}
                placeholder="Brief description of fees included in this category..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Icon Name / URL</Label>
              <Input
                value={formData.IconUrl}
                onChange={(e) => setFormData((p) => ({ ...p, IconUrl: e.target.value }))}
                placeholder="e.g. swap_horiz or https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Brand Color (Hex)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.ColorHex || "#10b981"}
                  onChange={(e) => setFormData((p) => ({ ...p, ColorHex: e.target.value }))}
                  className="h-9 w-12 rounded-lg border cursor-pointer p-0.5"
                />
                <Input
                  className="font-mono"
                  value={formData.ColorHex}
                  onChange={(e) => setFormData((p) => ({ ...p, ColorHex: e.target.value }))}
                  placeholder="#10b981"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Display Rank</Label>
              <Input
                type="number"
                value={formData.Rank}
                onChange={(e) => setFormData((p) => ({ ...p, Rank: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={formData.Status}
                onValueChange={(v) => setFormData((p) => ({ ...p, Status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>&quot;{itemToDelete?.CategoryName}&quot;</strong> ({itemToDelete?.CategoryCode}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
