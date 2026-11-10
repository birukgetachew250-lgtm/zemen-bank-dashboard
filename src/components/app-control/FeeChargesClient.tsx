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
import { Switch } from "@/components/ui/switch";
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
  Receipt,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Percent,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeFeeCategory, type FeeCategoryItem } from "./FeeCategoriesClient";

export interface FeeChargeItem {
  FeeId: string;
  CategoryId: string;
  CategoryName: string;
  CategoryCode: string;
  FeeName: string;
  FeeCode: string;
  TransactionType: string;
  TransactionSubType: string;
  Description: string;
  FeeAmount: number;
  IsFree: boolean;
  FeePercentage: number | null;
  MinFeeAmount: number | null;
  MaxFeeAmount: number | null;
  MinTransactionAmount: number | null;
  MaxTransactionAmount: number | null;
  Currency: string;
  FeeFrequency: string;
  EffectiveFrom: string;
  EffectiveTo: string;
  IsVATApplicable: boolean;
  VATPercentage: number | null;
  IsWaivedForPremium: boolean;
  FreeTransactionsLimit: number | null;
  FreeTransactionsPeriod: string;
  Notes: string;
  Status: string;
  Rank: number;
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

function toDateInputValue(val: any): string {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function normalizeFeeCharge(row: any): FeeChargeItem {
  const isFreeRaw = pickField(row, "IsFree");
  const isVatRaw = pickField(row, "IsVATApplicable");
  const isWaivedRaw = pickField(row, "IsWaivedForPremium");

  const numOrNull = (v: any) =>
    v === undefined || v === null || v === "" ? null : Number(v);

  return {
    FeeId: String(pickField(row, "FeeId", "ChargeId", "Id") ?? ""),
    CategoryId: String(pickField(row, "CategoryId") ?? ""),
    CategoryName: String(pickField(row, "CategoryName") ?? ""),
    CategoryCode: String(pickField(row, "CategoryCode") ?? ""),
    FeeName: String(pickField(row, "FeeName", "ChargeName", "Name") ?? ""),
    FeeCode: String(pickField(row, "FeeCode", "ChargeCode", "Code") ?? ""),
    TransactionType: String(pickField(row, "TransactionType") ?? "TRANSFER"),
    TransactionSubType: String(pickField(row, "TransactionSubType") ?? ""),
    Description: String(pickField(row, "Description") ?? ""),
    FeeAmount: Number(pickField(row, "FeeAmount") ?? 0),
    IsFree: isFreeRaw === 1 || isFreeRaw === true || isFreeRaw === "1",
    FeePercentage: numOrNull(pickField(row, "FeePercentage")),
    MinFeeAmount: numOrNull(pickField(row, "MinFeeAmount", "MinFee")),
    MaxFeeAmount: numOrNull(pickField(row, "MaxFeeAmount", "MaxFee")),
    MinTransactionAmount: numOrNull(pickField(row, "MinTransactionAmount")),
    MaxTransactionAmount: numOrNull(pickField(row, "MaxTransactionAmount")),
    Currency: String(pickField(row, "Currency") ?? "ETB"),
    FeeFrequency: String(pickField(row, "FeeFrequency") ?? "PerTransaction"),
    EffectiveFrom: toDateInputValue(pickField(row, "EffectiveFrom")),
    EffectiveTo: toDateInputValue(pickField(row, "EffectiveTo")),
    IsVATApplicable: isVatRaw === 1 || isVatRaw === true || isVatRaw === "1",
    VATPercentage: numOrNull(pickField(row, "VATPercentage")),
    IsWaivedForPremium:
      isWaivedRaw === 1 || isWaivedRaw === true || isWaivedRaw === "1",
    FreeTransactionsLimit: numOrNull(pickField(row, "FreeTransactionsLimit")),
    FreeTransactionsPeriod: String(
      pickField(row, "FreeTransactionsPeriod") ?? ""
    ),
    Notes: String(pickField(row, "Notes") ?? ""),
    Status: String(pickField(row, "Status") ?? "Active"),
    Rank: Number(pickField(row, "Rank") ?? 0),
  };
}

const EMPTY_FORM = {
  CategoryId: "",
  FeeName: "",
  FeeCode: "",
  TransactionType: "TRANSFER",
  TransactionSubType: "",
  Description: "",
  FeeAmount: "0",
  FeePercentage: "",
  MinFeeAmount: "",
  MaxFeeAmount: "",
  MinTransactionAmount: "",
  MaxTransactionAmount: "",
  Currency: "ETB",
  FeeFrequency: "PerTransaction",
  IsFree: false,
  IsVATApplicable: false,
  VATPercentage: "15",
  IsWaivedForPremium: false,
  FreeTransactionsLimit: "",
  FreeTransactionsPeriod: "Monthly",
  EffectiveFrom: "",
  EffectiveTo: "",
  Notes: "",
  Rank: "0",
  Status: "Active",
};

export default function FeeChargesClient() {
  const { toast } = useToast();
  const [items, setItems] = useState<FeeChargeItem[]>([]);
  const [categories, setCategories] = useState<FeeCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeChargeItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FeeChargeItem | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const ts = Date.now();
      const [chargesRes, catsRes] = await Promise.all([
        fetch(`/api/app-control/fee-charges?t=${ts}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch(`/api/app-control/fee-categories?t=${ts}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      const chargesData = await chargesRes.json();
      const catsData = await catsRes.json();

      setItems(
        Array.isArray(chargesData) ? chargesData.map(normalizeFeeCharge) : []
      );
      setCategories(
        Array.isArray(catsData) ? catsData.map(normalizeFeeCategory) : []
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to load Fee Charges & Categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "ALL" && item.CategoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "ALL" && item.Status !== statusFilter) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.FeeName.toLowerCase().includes(term) ||
        item.FeeCode.toLowerCase().includes(term) ||
        item.CategoryName.toLowerCase().includes(term) ||
        item.TransactionType.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      ...EMPTY_FORM,
      CategoryId:
        categoryFilter !== "ALL"
          ? categoryFilter
          : categories[0]?.CategoryId || "",
      Rank: String(items.length + 1),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (rawItem: FeeChargeItem) => {
    const item = normalizeFeeCharge(rawItem);
    setEditingItem(item);
    setFormData({
      CategoryId: item.CategoryId || categories[0]?.CategoryId || "",
      FeeName: item.FeeName || "",
      FeeCode: item.FeeCode || "",
      TransactionType: item.TransactionType || "TRANSFER",
      TransactionSubType: item.TransactionSubType || "",
      Description: item.Description || "",
      FeeAmount: String(item.FeeAmount ?? 0),
      FeePercentage:
        item.FeePercentage !== null && item.FeePercentage !== undefined
          ? String(item.FeePercentage)
          : "",
      MinFeeAmount:
        item.MinFeeAmount !== null && item.MinFeeAmount !== undefined
          ? String(item.MinFeeAmount)
          : "",
      MaxFeeAmount:
        item.MaxFeeAmount !== null && item.MaxFeeAmount !== undefined
          ? String(item.MaxFeeAmount)
          : "",
      MinTransactionAmount:
        item.MinTransactionAmount !== null &&
        item.MinTransactionAmount !== undefined
          ? String(item.MinTransactionAmount)
          : "",
      MaxTransactionAmount:
        item.MaxTransactionAmount !== null &&
        item.MaxTransactionAmount !== undefined
          ? String(item.MaxTransactionAmount)
          : "",
      Currency: item.Currency || "ETB",
      FeeFrequency: item.FeeFrequency || "PerTransaction",
      IsFree: Boolean(item.IsFree),
      IsVATApplicable: Boolean(item.IsVATApplicable),
      VATPercentage:
        item.VATPercentage !== null && item.VATPercentage !== undefined
          ? String(item.VATPercentage)
          : "15",
      IsWaivedForPremium: Boolean(item.IsWaivedForPremium),
      FreeTransactionsLimit:
        item.FreeTransactionsLimit !== null &&
        item.FreeTransactionsLimit !== undefined
          ? String(item.FreeTransactionsLimit)
          : "",
      FreeTransactionsPeriod: item.FreeTransactionsPeriod || "Monthly",
      EffectiveFrom: item.EffectiveFrom || "",
      EffectiveTo: item.EffectiveTo || "",
      Notes: item.Notes || "",
      Rank: String(item.Rank ?? 0),
      Status: item.Status || "Active",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !formData.FeeName.trim() ||
      !formData.FeeCode.trim() ||
      !formData.CategoryId ||
      !formData.TransactionType.trim()
    ) {
      toast({
        title: "Validation Error",
        description:
          "Fee Name, Fee Code, Fee Category, and Transaction Type are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = !!editingItem;
      const numOrNull = (val: string) =>
        val === "" || val === null || val === undefined ? null : Number(val);

      const payload: Record<string, any> = {
        ...(isEdit ? { FeeId: editingItem.FeeId } : {}),
        CategoryId: formData.CategoryId,
        FeeName: formData.FeeName.trim(),
        FeeCode: formData.FeeCode.trim().toUpperCase(),
        TransactionType: formData.TransactionType.trim(),
        TransactionSubType: formData.TransactionSubType.trim() || null,
        Description: formData.Description.trim() || null,
        FeeAmount: Number(formData.FeeAmount) || 0,
        FeePercentage: numOrNull(formData.FeePercentage),
        MinFeeAmount: numOrNull(formData.MinFeeAmount),
        MaxFeeAmount: numOrNull(formData.MaxFeeAmount),
        MinTransactionAmount: numOrNull(formData.MinTransactionAmount),
        MaxTransactionAmount: numOrNull(formData.MaxTransactionAmount),
        Currency: formData.Currency.trim() || "ETB",
        FeeFrequency: formData.FeeFrequency || "PerTransaction",
        IsFree: formData.IsFree,
        IsVATApplicable: formData.IsVATApplicable,
        VATPercentage: formData.IsVATApplicable
          ? numOrNull(formData.VATPercentage)
          : null,
        IsWaivedForPremium: formData.IsWaivedForPremium,
        FreeTransactionsLimit: numOrNull(formData.FreeTransactionsLimit),
        FreeTransactionsPeriod: formData.FreeTransactionsLimit
          ? formData.FreeTransactionsPeriod || null
          : null,
        EffectiveFrom: formData.EffectiveFrom || null,
        EffectiveTo: formData.EffectiveTo || null,
        Notes: formData.Notes.trim() || null,
        Rank: Number(formData.Rank) || 0,
        Status: formData.Status || "Active",
      };

      const res = await fetch("/api/app-control/fee-charges", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save Fee Charge");
      }

      toast({
        title: isEdit ? "Fee Charge Updated" : "Fee Charge Created",
        description: `"${formData.FeeName}" has been saved.`,
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      await fetchData();
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
      const res = await fetch("/api/app-control/fee-charges", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ FeeId: itemToDelete.FeeId }),
      });
      if (res.status !== 204 && !res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete failed");
      }
      toast({
        title: "Deleted",
        description: `"${itemToDelete.FeeName}" removed.`,
      });
      setItemToDelete(null);
      await fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const activeCount = items.filter((i) => i.Status === "Active").length;
  const freeCount = items.filter((i) => i.IsFree).length;
  const vatCount = items.filter((i) => i.IsVATApplicable).length;

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            "radial-gradient(85% 140% at 100% 0%, hsl(38 90% 45% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 77% 40% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))",
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200 backdrop-blur-sm">
              <Receipt className="h-3.5 w-3.5" /> App Control · Service Tariff &amp; Fee Schedule
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Fee Charges
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Manage flat fees, percentage charges, VAT rules, premium waivers, and transaction thresholds linked to each Fee Category.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={fetchData}
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
              Add Fee Charge
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="relative z-10 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Total Fee Rules</p>
              <p className="text-xl font-bold">{items.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Active Rules</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Free Services</p>
              <p className="text-xl font-bold">{freeCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 px-4 py-3 border border-white/10 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-200">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">VAT Applicable</p>
              <p className="text-xl font-bold">{vatCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-muted/20 border-b pb-4">
          <div>
            <CardTitle className="text-lg">Fee Schedule Directory</CardTitle>
            <CardDescription>
              Filter by Fee Category or search by charge name, code, or transaction type.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fee name, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] rounded-xl">
                <SelectValue placeholder="All Fee Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Fee Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.CategoryId} value={cat.CategoryId}>
                    {cat.CategoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    <TableHead className="pl-6">Fee Name &amp; Code</TableHead>
                    <TableHead>Fee Category</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>Pricing Structure</TableHead>
                    <TableHead>VAT &amp; Waivers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No fee charges found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.FeeId} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6">
                          <div className="font-semibold text-foreground">{item.FeeName}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {item.FeeCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                            {item.CategoryName ||
                              categories.find((c) => c.CategoryId === item.CategoryId)
                                ?.CategoryName ||
                              "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{item.TransactionType || "-"}</div>
                          {item.TransactionSubType && (
                            <div className="text-xs text-muted-foreground">
                              {item.TransactionSubType}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.IsFree ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              Free of Charge
                            </Badge>
                          ) : (
                            <div className="space-y-0.5 text-sm">
                              <div className="font-semibold">
                                {item.Currency} {Number(item.FeeAmount || 0).toFixed(2)}
                                {item.FeePercentage ? ` + ${item.FeePercentage}%` : ""}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.FeeFrequency}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.IsVATApplicable ? (
                              <Badge variant="secondary" className="text-xs">
                                VAT {item.VATPercentage ?? 15}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No VAT</span>
                            )}
                            {item.IsWaivedForPremium && (
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                VIP Waived
                              </Badge>
                            )}
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
                              title="Edit Fee Charge"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setItemToDelete(item)}
                              title="Delete Fee Charge"
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

      {/* Create / Edit Fee Charge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingItem ? "Edit Fee Charge" : "Add Fee Charge"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Editing fee schedule "${editingItem.FeeName}" (${editingItem.FeeCode}).`
                : "Configure a new fee schedule and assign it to a Fee Category."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Section 1: Identity & Category Dropdown */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Charge Identity &amp; Category
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Fee Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.CategoryId}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, CategoryId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Fee Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.CategoryId} value={cat.CategoryId}>
                          {cat.CategoryName} ({cat.CategoryCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Fee Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.FeeName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, FeeName: e.target.value }))
                    }
                    placeholder="e.g. RTGS Interbank Transfer Fee"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Fee Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="font-mono uppercase"
                    value={formData.FeeCode}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        FeeCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. FEE_RTGS_TRANSFER"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Transaction Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.TransactionType}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        TransactionType: e.target.value,
                      }))
                    }
                    placeholder="e.g. TRANSFER, BILL_PAYMENT, TELEBIRR"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Transaction Sub-Type (Optional)</Label>
                  <Input
                    value={formData.TransactionSubType}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        TransactionSubType: e.target.value,
                      }))
                    }
                    placeholder="e.g. OTHER_BANK, WALLET"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Fee Frequency</Label>
                  <Select
                    value={formData.FeeFrequency}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, FeeFrequency: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PerTransaction">Per Transaction</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    value={formData.Description}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, Description: e.target.value }))
                    }
                    placeholder="Customer-facing description of this fee..."
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Thresholds */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Pricing &amp; Transaction Thresholds
                </p>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Free Service (0 Fee)</Label>
                  <Switch
                    checked={formData.IsFree}
                    onCheckedChange={(v) =>
                      setFormData((p) => ({
                        ...p,
                        IsFree: v,
                        ...(v ? { FeeAmount: "0", FeePercentage: "" } : {}),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input
                    value={formData.Currency}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, Currency: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Fixed Fee Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={formData.IsFree}
                    value={formData.FeeAmount}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, FeeAmount: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Fee Percentage (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={formData.IsFree}
                    value={formData.FeePercentage}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, FeePercentage: e.target.value }))
                    }
                    placeholder="Optional %"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Min Fee Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.MinFeeAmount}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, MinFeeAmount: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Max Fee Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.MaxFeeAmount}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, MaxFeeAmount: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Display Rank</Label>
                  <Input
                    type="number"
                    value={formData.Rank}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, Rank: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Min Transaction Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.MinTransactionAmount}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        MinTransactionAmount: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Max Transaction Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.MaxTransactionAmount}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        MaxTransactionAmount: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={formData.Status}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, Status: v }))
                    }
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
            </div>

            {/* Section 3: VAT, Waivers & Effective Dates */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Tax, Premium Waivers &amp; Validity
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                  <div>
                    <Label className="text-sm">VAT Applicable</Label>
                    <p className="text-xs text-muted-foreground">
                      Apply VAT percentage on top of the fee
                    </p>
                  </div>
                  <Switch
                    checked={formData.IsVATApplicable}
                    onCheckedChange={(v) =>
                      setFormData((p) => ({ ...p, IsVATApplicable: v }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                  <div>
                    <Label className="text-sm">Waived for Premium / VIP</Label>
                    <p className="text-xs text-muted-foreground">
                      Exempt premium tier customers
                    </p>
                  </div>
                  <Switch
                    checked={formData.IsWaivedForPremium}
                    onCheckedChange={(v) =>
                      setFormData((p) => ({ ...p, IsWaivedForPremium: v }))
                    }
                  />
                </div>

                {formData.IsVATApplicable && (
                  <div className="space-y-1.5">
                    <Label>VAT Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.VATPercentage}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          VATPercentage: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Free Transactions Limit (Count)</Label>
                  <Input
                    type="number"
                    value={formData.FreeTransactionsLimit}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        FreeTransactionsLimit: e.target.value,
                      }))
                    }
                    placeholder="e.g. 3 free per period"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Free Transactions Reset Period</Label>
                  <Select
                    value={formData.FreeTransactionsPeriod || "Monthly"}
                    onValueChange={(v) =>
                      setFormData((p) => ({
                        ...p,
                        FreeTransactionsPeriod: v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Effective From</Label>
                  <Input
                    type="date"
                    value={formData.EffectiveFrom}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        EffectiveFrom: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Effective To</Label>
                  <Input
                    type="date"
                    value={formData.EffectiveTo}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        EffectiveTo: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Internal Notes</Label>
                  <Input
                    value={formData.Notes}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, Notes: e.target.value }))
                    }
                    placeholder="Optional regulatory or tariff reference notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Update Fee Charge" : "Create Fee Charge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Charge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>&quot;{itemToDelete?.FeeName}&quot;</strong> (
              {itemToDelete?.FeeCode}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
