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
import { Edit, Loader2, PlusCircle, Trash2 } from "lucide-react";
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
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

const buildEmptyForm = (): UsageFormData => {
  const range = getDefaultDateRange();
  return {
    cifNumber: "",
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

export function CustomerLimitUsagesClient({ initialItems, dropdownData }: CustomerLimitUsagesClientProps) {
  const [items, setItems] = useState<CustomerLimitUsage[]>(initialItems);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerLimitUsage | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CustomerLimitUsage | null>(null);
  const [formData, setFormData] = useState<UsageFormData>(buildEmptyForm());

  const { toast } = useToast();

  const sortByRecent = useMemo(
    () => [...items].sort((a, b) => new Date(b.lastTransactionDate).getTime() - new Date(a.lastTransactionDate).getTime()),
    [items]
  );

  const refreshItems = async () => {
    const res = await fetch("/api/limits/usages");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to refresh items");
    if (Array.isArray(data)) setItems(data);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData(buildEmptyForm());
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
      toast({ variant: "destructive", title: "Missing Fields", description: validationMessage });
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

      await refreshItems();
      toast({ title: "Saved", description: `Limit usage ${editingItem ? "updated" : "created"} successfully.` });
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Unable to save." });
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
      toast({ variant: "destructive", title: "Delete Error", description: error.message || "Unable to delete." });
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Limit Usage</CardTitle>
            <CardDescription>Manage per-customer usage windows and consumed amounts for daily, weekly, and monthly limits.</CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Usage
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CIF</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Txn Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Daily Used</TableHead>
                  <TableHead>Weekly Used</TableHead>
                  <TableHead>Monthly Used</TableHead>
                  <TableHead>Last Txn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortByRecent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.cifNumber}</TableCell>
                    <TableCell>{item.customerCategoryName || "All"}</TableCell>
                    <TableCell>{item.transactionTypeName || "All"}</TableCell>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>
                      <div>{formatMoney(item.dailyAmountUsed, item.currency)}</div>
                      <div className="text-xs text-muted-foreground">Count: {item.dailyTransactionCount}</div>
                    </TableCell>
                    <TableCell>
                      <div>{formatMoney(item.weeklyAmountUsed, item.currency)}</div>
                      <div className="text-xs text-muted-foreground">Count: {item.weeklyTransactionCount}</div>
                    </TableCell>
                    <TableCell>
                      <div>{formatMoney(item.monthlyAmountUsed, item.currency)}</div>
                      <div className="text-xs text-muted-foreground">Count: {item.monthlyTransactionCount}</div>
                    </TableCell>
                    <TableCell>{new Date(item.lastTransactionDate).toLocaleString()}</TableCell>
                    <TableCell>
                      {item.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setItemToDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isDialogOpen && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{editingItem ? "Edit" : "Add"} Customer Limit Usage</CardTitle>
            <CardDescription>Configure usage counters and period boundaries for a customer and service.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>CIF Number</Label>
              <Input value={formData.cifNumber} onChange={(e) => setFormData((p) => ({ ...p, cifNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input value={formData.serviceName} onChange={(e) => setFormData((p) => ({ ...p, serviceName: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Customer Category</Label>
              <Select value={formData.customerCategoryId} onValueChange={(value) => setFormData((p) => ({ ...p, customerCategoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.customerCategories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={formData.transactionTypeId} onValueChange={(value) => setFormData((p) => ({ ...p, transactionTypeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.transactionTypes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Applied Limit Rule (optional)</Label>
              <Select value={formData.appliedLimitRuleId} onValueChange={(value) => setFormData((p) => ({ ...p, appliedLimitRuleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.limitRules.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Applied Exception (optional)</Label>
              <Select value={formData.appliedExceptionId} onValueChange={(value) => setFormData((p) => ({ ...p, appliedExceptionId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exception" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.limitExceptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={formData.currency} onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Daily Period Start</Label>
              <Input type="datetime-local" value={formData.dailyPeriodStart} onChange={(e) => setFormData((p) => ({ ...p, dailyPeriodStart: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Daily Period End</Label>
              <Input type="datetime-local" value={formData.dailyPeriodEnd} onChange={(e) => setFormData((p) => ({ ...p, dailyPeriodEnd: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Daily Amount Used</Label>
              <Input type="number" value={formData.dailyAmountUsed} onChange={(e) => setFormData((p) => ({ ...p, dailyAmountUsed: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Daily Transaction Count</Label>
              <Input type="number" value={formData.dailyTransactionCount} onChange={(e) => setFormData((p) => ({ ...p, dailyTransactionCount: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Weekly Period Start</Label>
              <Input type="datetime-local" value={formData.weeklyPeriodStart} onChange={(e) => setFormData((p) => ({ ...p, weeklyPeriodStart: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Weekly Period End</Label>
              <Input type="datetime-local" value={formData.weeklyPeriodEnd} onChange={(e) => setFormData((p) => ({ ...p, weeklyPeriodEnd: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Weekly Amount Used</Label>
              <Input type="number" value={formData.weeklyAmountUsed} onChange={(e) => setFormData((p) => ({ ...p, weeklyAmountUsed: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Weekly Transaction Count</Label>
              <Input type="number" value={formData.weeklyTransactionCount} onChange={(e) => setFormData((p) => ({ ...p, weeklyTransactionCount: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Monthly Period Start</Label>
              <Input type="datetime-local" value={formData.monthlyPeriodStart} onChange={(e) => setFormData((p) => ({ ...p, monthlyPeriodStart: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Period End</Label>
              <Input type="datetime-local" value={formData.monthlyPeriodEnd} onChange={(e) => setFormData((p) => ({ ...p, monthlyPeriodEnd: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Amount Used</Label>
              <Input type="number" value={formData.monthlyAmountUsed} onChange={(e) => setFormData((p) => ({ ...p, monthlyAmountUsed: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Transaction Count</Label>
              <Input type="number" value={formData.monthlyTransactionCount} onChange={(e) => setFormData((p) => ({ ...p, monthlyTransactionCount: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Last Transaction Date</Label>
              <Input type="datetime-local" value={formData.lastTransactionDate} onChange={(e) => setFormData((p) => ({ ...p, lastTransactionDate: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Last Daily Reset (optional)</Label>
              <Input type="datetime-local" value={formData.lastDailyReset} onChange={(e) => setFormData((p) => ({ ...p, lastDailyReset: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Weekly Reset (optional)</Label>
              <Input type="datetime-local" value={formData.lastWeeklyReset} onChange={(e) => setFormData((p) => ({ ...p, lastWeeklyReset: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Monthly Reset (optional)</Label>
              <Input type="datetime-local" value={formData.lastMonthlyReset} onChange={(e) => setFormData((p) => ({ ...p, lastMonthlyReset: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span className="text-sm text-muted-foreground">Active usage record</span>
              </div>
            </div>
          </CardContent>

          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Usage
            </Button>
          </div>
        </Card>
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer limit usage for CIF {itemToDelete?.cifNumber}.
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
    </>
  );
}
