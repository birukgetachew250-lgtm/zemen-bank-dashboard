"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Loader2,
  PlusCircle,
  Trash2,
  Search,
  Activity,
  UserCheck,
  Wallet,
  CalendarClock,
  RefreshCw,
  Filter,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DropdownItem {
  id: string;
  name: string;
}

export interface LimitUsageDropdownData {
  customerCategories: DropdownItem[];
  transactionTypes: DropdownItem[];
  limitRules: DropdownItem[];
  limitExceptions: DropdownItem[];
}

export interface CustomerLimitUsage {
  id: string;
  cifNumber: string;
  customerCategoryId: string | null;
  customerCategoryName: string | null;
  transactionTypeId: string | null;
  transactionTypeName: string | null;
  serviceName: string;
  currency: string;
  dailyPeriodStart: string;
  dailyPeriodEnd: string;
  dailyAmountUsed: number;
  dailyTransactionCount: number;
  weeklyPeriodStart: string;
  weeklyPeriodEnd: string;
  weeklyAmountUsed: number;
  weeklyTransactionCount: number;
  monthlyPeriodStart: string;
  monthlyPeriodEnd: string;
  monthlyAmountUsed: number;
  monthlyTransactionCount: number;
  appliedLimitRuleId: string | null;
  appliedExceptionId: string | null;
  isActive: boolean;
  lastTransactionDate: string;
  lastDailyReset: string | null;
  lastWeeklyReset: string | null;
  lastMonthlyReset: string | null;
}

interface CustomerLimitUsagesClientProps {
  initialItems: CustomerLimitUsage[];
  dropdownData: LimitUsageDropdownData;
}

interface UsageFormData {
  cifNumber: string;
  customerCategoryId: string;
  transactionTypeId: string;
  serviceName: string;
  currency: string;
  dailyPeriodStart: string;
  dailyPeriodEnd: string;
  dailyAmountUsed: string;
  dailyTransactionCount: string;
  weeklyPeriodStart: string;
  weeklyPeriodEnd: string;
  weeklyAmountUsed: string;
  weeklyTransactionCount: string;
  monthlyPeriodStart: string;
  monthlyPeriodEnd: string;
  monthlyAmountUsed: string;
  monthlyTransactionCount: string;
  appliedLimitRuleId: string;
  appliedExceptionId: string;
  isActive: boolean;
  lastTransactionDate: string;
  lastDailyReset: string;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
}

const formatMoney = (value: number, currency: string) => {
  if (value === null || value === undefined) return "0.00";
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const toDatetimeLocal = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
};

const getDefaultDateRange = () => {
  const now = new Date();
  const toLocalInput = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 0, 0);

  return {
    dailyPeriodStart: toLocalInput(dayStart),
    dailyPeriodEnd: toLocalInput(dayEnd),
    weeklyPeriodStart: toLocalInput(weekStart),
    weeklyPeriodEnd: toLocalInput(weekEnd),
    monthlyPeriodStart: toLocalInput(monthStart),
    monthlyPeriodEnd: toLocalInput(monthEnd),
    lastTransactionDate: toLocalInput(now),
  };
};

const buildEmptyForm = (defaultCif = ""): UsageFormData => {
  const range = getDefaultDateRange();
  return {
    cifNumber: defaultCif,
    customerCategoryId: "",
    transactionTypeId: "",
    serviceName: "",
    currency: "ETB",
    dailyPeriodStart: range.dailyPeriodStart,
    dailyPeriodEnd: range.dailyPeriodEnd,
    dailyAmountUsed: "0",
    dailyTransactionCount: "0",
    weeklyPeriodStart: range.weeklyPeriodStart,
    weeklyPeriodEnd: range.weeklyPeriodEnd,
    weeklyAmountUsed: "0",
    weeklyTransactionCount: "0",
    monthlyPeriodStart: range.monthlyPeriodStart,
    monthlyPeriodEnd: range.monthlyPeriodEnd,
    monthlyAmountUsed: "0",
    monthlyTransactionCount: "0",
    appliedLimitRuleId: "",
    appliedExceptionId: "",
    isActive: true,
    lastTransactionDate: range.lastTransactionDate,
    lastDailyReset: "",
    lastWeeklyReset: "",
    lastMonthlyReset: "",
  };
};

export function CustomerLimitUsagesClient({
  initialItems,
  dropdownData,
}: CustomerLimitUsagesClientProps) {
  const [items, setItems] = useState<CustomerLimitUsage[]>(initialItems);
  const [cifQuery, setCifQuery] = useState("");
  const [searchedCif, setSearchedCif] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerLimitUsage | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CustomerLimitUsage | null>(null);
  const [formData, setFormData] = useState<UsageFormData>(buildEmptyForm());

  const { toast } = useToast();

  const handleSearchByCif = async (cifToSearch?: string) => {
    const targetCif = (cifToSearch ?? cifQuery).trim();
    if (!targetCif) {
      toast({
        variant: "destructive",
        title: "CIF Number Required",
        description: "Please enter a Customer CIF Number to query limit usages.",
      });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/limits/usages?cif=${encodeURIComponent(targetCif)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to query usages");
      setItems(Array.isArray(data) ? data : []);
      setSearchedCif(targetCif);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message || "Unable to fetch usage records.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const filteredItems = useMemo(() => {
    return [...items]
      .filter((item) => {
        if (
          serviceFilter.trim() &&
          !(item.serviceName || "")
            .toLowerCase()
            .includes(serviceFilter.trim().toLowerCase()) &&
          !(item.transactionTypeName || "")
            .toLowerCase()
            .includes(serviceFilter.trim().toLowerCase())
        ) {
          return false;
        }
        if (statusFilter === "ACTIVE" && !item.isActive) return false;
        if (statusFilter === "INACTIVE" && item.isActive) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.lastTransactionDate).getTime() -
          new Date(a.lastTransactionDate).getTime()
      );
  }, [items, serviceFilter, statusFilter]);

  const summary = useMemo(() => {
    const totalRecords = filteredItems.length;
    const activeRecords = filteredItems.filter((i) => i.isActive).length;
    const totalDaily = filteredItems.reduce(
      (sum, i) => sum + (Number(i.dailyAmountUsed) || 0),
      0
    );
    const totalMonthly = filteredItems.reduce(
      (sum, i) => sum + (Number(i.monthlyAmountUsed) || 0),
      0
    );
    return { totalRecords, activeRecords, totalDaily, totalMonthly };
  }, [filteredItems]);

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData(buildEmptyForm(searchedCif || cifQuery.trim()));
    setDialogOpen(true);
  };

  const openEditDialog = (item: CustomerLimitUsage) => {
    setEditingItem(item);
    setFormData({
      cifNumber: item.cifNumber || "",
      customerCategoryId: item.customerCategoryId || "",
      transactionTypeId: item.transactionTypeId || "",
      serviceName: item.serviceName || "",
      currency: item.currency || "ETB",
      dailyPeriodStart: toDatetimeLocal(item.dailyPeriodStart),
      dailyPeriodEnd: toDatetimeLocal(item.dailyPeriodEnd),
      dailyAmountUsed: String(item.dailyAmountUsed ?? 0),
      dailyTransactionCount: String(item.dailyTransactionCount ?? 0),
      weeklyPeriodStart: toDatetimeLocal(item.weeklyPeriodStart),
      weeklyPeriodEnd: toDatetimeLocal(item.weeklyPeriodEnd),
      weeklyAmountUsed: String(item.weeklyAmountUsed ?? 0),
      weeklyTransactionCount: String(item.weeklyTransactionCount ?? 0),
      monthlyPeriodStart: toDatetimeLocal(item.monthlyPeriodStart),
      monthlyPeriodEnd: toDatetimeLocal(item.monthlyPeriodEnd),
      monthlyAmountUsed: String(item.monthlyAmountUsed ?? 0),
      monthlyTransactionCount: String(item.monthlyTransactionCount ?? 0),
      appliedLimitRuleId: item.appliedLimitRuleId || "",
      appliedExceptionId: item.appliedExceptionId || "",
      isActive: item.isActive,
      lastTransactionDate: toDatetimeLocal(item.lastTransactionDate),
      lastDailyReset: toDatetimeLocal(item.lastDailyReset),
      lastWeeklyReset: toDatetimeLocal(item.lastWeeklyReset),
      lastMonthlyReset: toDatetimeLocal(item.lastMonthlyReset),
    });
    setDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.cifNumber.trim()) return "CIF Number is required.";
    if (!formData.serviceName.trim()) return "Service Name is required.";

    const requiredDates: Array<[keyof UsageFormData, string]> = [
      ["dailyPeriodStart", "Daily period start"],
      ["dailyPeriodEnd", "Daily period end"],
      ["weeklyPeriodStart", "Weekly period start"],
      ["weeklyPeriodEnd", "Weekly period end"],
      ["monthlyPeriodStart", "Monthly period start"],
      ["monthlyPeriodEnd", "Monthly period end"],
      ["lastTransactionDate", "Last transaction date"],
    ];

    for (const [key, label] of requiredDates) {
      if (!formData[key]) return `${label} is required.`;
    }

    return null;
  };

  const handleSave = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: validationMessage,
      });
      return;
    }

    setIsSaving(true);
    const method = editingItem ? "PUT" : "POST";

    const payload: Record<string, any> = {
      cifNumber: formData.cifNumber.trim(),
      customerCategoryId: formData.customerCategoryId || null,
      transactionTypeId: formData.transactionTypeId || null,
      serviceName: formData.serviceName.trim(),
      currency: formData.currency || "ETB",
      dailyPeriodStart: formData.dailyPeriodStart,
      dailyPeriodEnd: formData.dailyPeriodEnd,
      dailyAmountUsed: formData.dailyAmountUsed,
      dailyTransactionCount: formData.dailyTransactionCount,
      weeklyPeriodStart: formData.weeklyPeriodStart,
      weeklyPeriodEnd: formData.weeklyPeriodEnd,
      weeklyAmountUsed: formData.weeklyAmountUsed,
      weeklyTransactionCount: formData.weeklyTransactionCount,
      monthlyPeriodStart: formData.monthlyPeriodStart,
      monthlyPeriodEnd: formData.monthlyPeriodEnd,
      monthlyAmountUsed: formData.monthlyAmountUsed,
      monthlyTransactionCount: formData.monthlyTransactionCount,
      appliedLimitRuleId: formData.appliedLimitRuleId || null,
      appliedExceptionId: formData.appliedExceptionId || null,
      isActive: formData.isActive,
      lastTransactionDate: formData.lastTransactionDate,
      lastDailyReset: formData.lastDailyReset || null,
      lastWeeklyReset: formData.lastWeeklyReset || null,
      lastMonthlyReset: formData.lastMonthlyReset || null,
    };

    if (editingItem) payload.id = editingItem.id;

    try {
      const res = await fetch("/api/limits/usages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.message || "Save failed");

      const cifToReload = formData.cifNumber.trim();
      setCifQuery(cifToReload);
      await handleSearchByCif(cifToReload);
      toast({
        title: "Saved",
        description: `Limit usage ${editingItem ? "updated" : "created"} successfully.`,
      });
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Unable to save.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/limits/usages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      if (res.status !== 204) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result?.message || "Delete failed");
      }

      setItems((prev) => prev.filter((entry) => entry.id !== itemToDelete.id));
      toast({ title: "Deleted", description: "Limit usage record removed." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: error.message || "Unable to delete.",
      });
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* On-Demand CIF Search Hero */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8 text-white shadow-xl"
        style={{
          background:
            "radial-gradient(85% 140% at 100% 0%, hsl(160 80% 35% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(220 80% 45% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))",
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-sm">
              <Activity className="h-3.5 w-3.5" /> On-Demand Customer Usage Inspector
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Customer Limit Usages
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Query accumulated Daily, Weekly, and Monthly transaction usage counters on demand by Customer CIF Number. Multiple service and transaction type counters per CIF are returned together.
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="rounded-xl bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg w-fit"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Usage Record
          </Button>
        </div>

        {/* CIF Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchByCif();
          }}
          className="relative z-10 mt-6 flex flex-col sm:flex-row gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-white/60" />
            <Input
              value={cifQuery}
              onChange={(e) => setCifQuery(e.target.value)}
              placeholder="Enter Customer CIF Number (e.g. 0012345)..."
              className="h-11 pl-11 rounded-xl border-white/20 bg-slate-950/60 text-white placeholder:text-white/50 font-mono text-sm focus-visible:ring-emerald-400"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md"
          >
            {isSearching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search CIF Usages
          </Button>
          {searchedCif && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSearchByCif(searchedCif)}
              disabled={isSearching}
              className="h-11 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", isSearching && "animate-spin")} />
            </Button>
          )}
        </form>
      </div>

      {/* Initial State before CIF Search */}
      {!searchedCif ? (
        <Card className="border-dashed border-2 border-border/70 rounded-2xl bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserCheck className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold">Search by Customer CIF Number</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Because customer limit usage tables contain high-volume transaction counters across all customers, records are loaded on demand. Enter a CIF number above to view all related usage counters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Summary Cards for Searched CIF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CIF Queried</p>
                  <p className="text-lg font-bold font-mono">{searchedCif}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {summary.totalRecords} Usage Counter(s)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Service Counters</p>
                  <p className="text-lg font-bold">
                    {summary.activeRecords} / {summary.totalRecords}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Across services &amp; types</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Combined Daily Used</p>
                  <p className="text-lg font-bold">{formatMoney(summary.totalDaily, "ETB")}</p>
                  <p className="text-[11px] text-muted-foreground">Sum across matched services</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Combined Monthly Used</p>
                  <p className="text-lg font-bold">{formatMoney(summary.totalMonthly, "ETB")}</p>
                  <p className="text-[11px] text-muted-foreground">Current monthly window</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Table Card */}
          <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 border-b pb-4">
              <div>
                <CardTitle className="text-lg">
                  Usage Counters for CIF <span className="font-mono text-primary">{searchedCif}</span>
                </CardTitle>
                <CardDescription>
                  Showing {filteredItems.length} related usage record(s) across services and transaction types.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by service or type..."
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="pl-8 w-56 rounded-xl"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active Only</SelectItem>
                    <SelectItem value="INACTIVE">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="pl-6">CIF Number</TableHead>
                      <TableHead>Service &amp; Txn Type</TableHead>
                      <TableHead>Daily Consumed</TableHead>
                      <TableHead>Weekly Consumed</TableHead>
                      <TableHead>Monthly Consumed</TableHead>
                      <TableHead>Last Transaction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          No usage records found for CIF <span className="font-mono font-semibold">{searchedCif}</span>.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6 font-mono font-semibold">
                            {item.cifNumber}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-foreground">{item.serviceName}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.transactionTypeName || "All Txn Types"} · {item.customerCategoryName || "All Categories"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {formatMoney(item.dailyAmountUsed, item.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.dailyTransactionCount} txn(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {formatMoney(item.weeklyAmountUsed, item.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.weeklyTransactionCount} txn(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {formatMoney(item.monthlyAmountUsed, item.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.monthlyTransactionCount} txn(s)
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.lastTransactionDate
                              ? new Date(item.lastTransactionDate).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {item.isActive ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(item)}
                                title="Edit Usage Counter"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setItemToDelete(item)}
                                title="Delete Usage Counter"
                              >
                                <Trash2 className="h-4 w-4" />
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
        </>
      )}

      {/* Add / Edit Usage Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingItem ? "Edit Customer Limit Usage" : "Add Customer Limit Usage"}
            </DialogTitle>
            <DialogDescription>
              Configure usage counters and period boundaries for a specific customer CIF and service.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>CIF Number <span className="text-red-500">*</span></Label>
              <Input
                className="font-mono"
                value={formData.cifNumber}
                onChange={(e) => setFormData((p) => ({ ...p, cifNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Service Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.serviceName}
                onChange={(e) => setFormData((p) => ({ ...p, serviceName: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Customer Category</Label>
              <Select
                value={formData.customerCategoryId || "__none__"}
                onValueChange={(value) =>
                  setFormData((p) => ({ ...p, customerCategoryId: value === "__none__" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">All Categories</SelectItem>
                  {dropdownData.customerCategories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Transaction Type</Label>
              <Select
                value={formData.transactionTypeId || "__none__"}
                onValueChange={(value) =>
                  setFormData((p) => ({ ...p, transactionTypeId: value === "__none__" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">All Types</SelectItem>
                  {dropdownData.transactionTypes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Applied Limit Rule (optional)</Label>
              <Select
                value={formData.appliedLimitRuleId || "__none__"}
                onValueChange={(value) =>
                  setFormData((p) => ({ ...p, appliedLimitRuleId: value === "__none__" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {dropdownData.limitRules.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Applied Exception (optional)</Label>
              <Select
                value={formData.appliedExceptionId || "__none__"}
                onValueChange={(value) =>
                  setFormData((p) => ({ ...p, appliedExceptionId: value === "__none__" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exception" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {dropdownData.limitExceptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input
                value={formData.currency}
                onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Last Transaction Date <span className="text-red-500">*</span></Label>
              <Input
                type="datetime-local"
                value={formData.lastTransactionDate}
                onChange={(e) => setFormData((p) => ({ ...p, lastTransactionDate: e.target.value }))}
              />
            </div>

            {/* Daily Window */}
            <div className="md:col-span-2 rounded-xl border bg-muted/20 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Daily Usage Window
              </p>
              <div className="space-y-1">
                <Label className="text-xs">Daily Period Start</Label>
                <Input
                  type="datetime-local"
                  value={formData.dailyPeriodStart}
                  onChange={(e) => setFormData((p) => ({ ...p, dailyPeriodStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Daily Period End</Label>
                <Input
                  type="datetime-local"
                  value={formData.dailyPeriodEnd}
                  onChange={(e) => setFormData((p) => ({ ...p, dailyPeriodEnd: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Daily Amount Used</Label>
                <Input
                  type="number"
                  value={formData.dailyAmountUsed}
                  onChange={(e) => setFormData((p) => ({ ...p, dailyAmountUsed: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Daily Transaction Count</Label>
                <Input
                  type="number"
                  value={formData.dailyTransactionCount}
                  onChange={(e) => setFormData((p) => ({ ...p, dailyTransactionCount: e.target.value }))}
                />
              </div>
            </div>

            {/* Weekly Window */}
            <div className="md:col-span-2 rounded-xl border bg-muted/20 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Weekly Usage Window
              </p>
              <div className="space-y-1">
                <Label className="text-xs">Weekly Period Start</Label>
                <Input
                  type="datetime-local"
                  value={formData.weeklyPeriodStart}
                  onChange={(e) => setFormData((p) => ({ ...p, weeklyPeriodStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weekly Period End</Label>
                <Input
                  type="datetime-local"
                  value={formData.weeklyPeriodEnd}
                  onChange={(e) => setFormData((p) => ({ ...p, weeklyPeriodEnd: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weekly Amount Used</Label>
                <Input
                  type="number"
                  value={formData.weeklyAmountUsed}
                  onChange={(e) => setFormData((p) => ({ ...p, weeklyAmountUsed: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weekly Transaction Count</Label>
                <Input
                  type="number"
                  value={formData.weeklyTransactionCount}
                  onChange={(e) => setFormData((p) => ({ ...p, weeklyTransactionCount: e.target.value }))}
                />
              </div>
            </div>

            {/* Monthly Window */}
            <div className="md:col-span-2 rounded-xl border bg-muted/20 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p className="sm:col-span-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Monthly Usage Window
              </p>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Period Start</Label>
                <Input
                  type="datetime-local"
                  value={formData.monthlyPeriodStart}
                  onChange={(e) => setFormData((p) => ({ ...p, monthlyPeriodStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Period End</Label>
                <Input
                  type="datetime-local"
                  value={formData.monthlyPeriodEnd}
                  onChange={(e) => setFormData((p) => ({ ...p, monthlyPeriodEnd: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Amount Used</Label>
                <Input
                  type="number"
                  value={formData.monthlyAmountUsed}
                  onChange={(e) => setFormData((p) => ({ ...p, monthlyAmountUsed: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Transaction Count</Label>
                <Input
                  type="number"
                  value={formData.monthlyTransactionCount}
                  onChange={(e) => setFormData((p) => ({ ...p, monthlyTransactionCount: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span className="text-sm text-muted-foreground">Active usage counter</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Usage Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer limit usage record for CIF{" "}
              <strong>{itemToDelete?.cifNumber}</strong> ({itemToDelete?.serviceName}).
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
