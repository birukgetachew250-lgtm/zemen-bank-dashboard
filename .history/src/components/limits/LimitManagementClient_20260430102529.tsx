"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
import { DropdownItem } from "../charges/ChargeManagementClient";
import type { Interval } from "@/app/(main)/limits/page";
import { Separator } from "../ui/separator";
import Link from "next/link";

export interface LimitRule {
  id: string;
  customerCategoryId: string | null;
  customerCategoryIds?: string[];
  transactionTypeId: string | null;
  category: string;
  transactionType: string;
  serviceName: string | null;
  limitAggregationType?: "PER_SERVICE" | "SERVICE_GROUP";
  serviceNames?: string[];
  serviceGroupDisplay?: string;
  isGlobal: boolean;
  currency: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number | null;
}

const formatCurrency = (amount: number) => {
  if (amount === null || amount === undefined) return "Not Set";
  return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface LimitManagementClientProps {
  initialLimitRules: LimitRule[];
  customerCategories: DropdownItem[];
  transactionTypes: DropdownItem[];
  intervals: Interval[];
  serviceOptions: DropdownItem[];
}

export function LimitManagementClient({
  initialLimitRules,
  customerCategories,
  transactionTypes,
  intervals,
  serviceOptions,
}: LimitManagementClientProps) {
  const [limitRules, setLimitRules] = useState<LimitRule[]>(initialLimitRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<LimitRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<LimitRule | null>(null);

  const [ruleData, setRuleData] = useState<{
    categoryIds: string[];
    transactionTypeId: string;
    serviceName: string;
    limitAggregationType: "PER_SERVICE" | "SERVICE_GROUP";
    serviceNames: string[];
    isGlobal: boolean;
    currency: string;
    effectiveFrom: string;
    effectiveTo: string;
    perTransactionLimit: string;
    limits: { intervalId: string; amount: string }[];
  }>({
    categoryIds: [],
    transactionTypeId: "",
    serviceName: "",
    limitAggregationType: "PER_SERVICE",
    serviceNames: [],
    isGlobal: false,
    currency: "ETB",
    effectiveFrom: "",
    effectiveTo: "",
    perTransactionLimit: "",
    limits: [],
  });

  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingRule(null);
    setRuleData({
      categoryIds: [],
      transactionTypeId: "",
      serviceName: "",
      limitAggregationType: "PER_SERVICE",
      serviceNames: [],
      isGlobal: false,
      currency: "ETB",
      effectiveFrom: "",
      effectiveTo: "",
      perTransactionLimit: "",
      limits: [{ intervalId: "", amount: "" }],
    });
    setDialogOpen(true);
  };

  const openEditDialog = async (rule: LimitRule) => {
    setEditingRule(rule);
    try {
      const res = await fetch(`/api/limits/intervals-for-rule?ruleId=${rule.id}`);
      const intervalsData = await res.json();
      const limitsArr =
        Array.isArray(intervalsData) && intervalsData.length > 0
          ? intervalsData.map((i: any) => ({ intervalId: i.periodIntervalId, amount: String(i.limitAmount) }))
          : [{ intervalId: "", amount: "" }];

      setRuleData({
        categoryIds: rule.customerCategoryIds || (rule.customerCategoryId ? [rule.customerCategoryId] : []),
        transactionTypeId: rule.transactionTypeId || "",
        serviceName: rule.serviceName || "",
        limitAggregationType: rule.limitAggregationType || "PER_SERVICE",
        serviceNames: rule.serviceNames || [],
        isGlobal: rule.isGlobal,
        currency: rule.currency || "ETB",
        effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom).toISOString().slice(0, 16) : "",
        effectiveTo: rule.effectiveTo ? new Date(rule.effectiveTo).toISOString().slice(0, 16) : "",
        perTransactionLimit: rule.perTransactionLimit != null ? String(rule.perTransactionLimit) : "",
        limits: limitsArr,
      });
      setDialogOpen(true);
    } catch {
      setRuleData({
        categoryIds: rule.customerCategoryIds || (rule.customerCategoryId ? [rule.customerCategoryId] : []),
        transactionTypeId: rule.transactionTypeId || "",
        serviceName: rule.serviceName || "",
        limitAggregationType: rule.limitAggregationType || "PER_SERVICE",
        serviceNames: rule.serviceNames || [],
        isGlobal: rule.isGlobal,
        currency: rule.currency || "ETB",
        effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom).toISOString().slice(0, 16) : "",
        effectiveTo: rule.effectiveTo ? new Date(rule.effectiveTo).toISOString().slice(0, 16) : "",
        perTransactionLimit: rule.perTransactionLimit != null ? String(rule.perTransactionLimit) : "",
        limits: [{ intervalId: "", amount: "" }],
      });
      setDialogOpen(true);
    }
  };

  const handleLimitChange = (index: number, field: "intervalId" | "amount", value: string) => {
    const newLimits = [...ruleData.limits];
    newLimits[index] = { ...newLimits[index], [field]: value };
    setRuleData((prev) => ({ ...prev, limits: newLimits }));
  };

  const addLimitField = () => {
    setRuleData((prev) => ({
      ...prev,
      limits: [...prev.limits, { intervalId: "", amount: "" }],
    }));
  };

  const removeLimitField = (index: number) => {
    if (ruleData.limits.length <= 1) return;
    setRuleData((prev) => ({
      ...prev,
      limits: prev.limits.filter((_, i) => i !== index),
    }));
  };

  const handleSaveRule = async () => {
    if (ruleData.limits.some((l) => !l.intervalId || !l.amount)) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please define at least one valid interval and amount.",
      });
      return;
    }

    if (ruleData.limitAggregationType === "SERVICE_GROUP" && ruleData.serviceNames.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Services",
        description: "Select at least one service for SERVICE_GROUP aggregation.",
      });
      return;
    }

    setIsSaving(true);
    const limitsToSubmit = ruleData.limits.reduce((acc, limit) => {
      if (limit.intervalId && limit.amount) {
        acc[limit.intervalId] = limit.amount;
      }
      return acc;
    }, {} as Record<string, string>);

    const method = editingRule ? "PUT" : "POST";
    const payload = {
      id: editingRule?.id,
      categoryIds: ruleData.categoryIds,
      transactionTypeId: ruleData.transactionTypeId || null,
      serviceName: ruleData.limitAggregationType === "PER_SERVICE" ? ruleData.serviceName || null : null,
      limitAggregationType: ruleData.limitAggregationType,
      serviceNames: ruleData.limitAggregationType === "SERVICE_GROUP" ? ruleData.serviceNames : [],
      isGlobal: ruleData.isGlobal,
      currency: ruleData.currency || "ETB",
      effectiveFrom: ruleData.effectiveFrom || null,
      effectiveTo: ruleData.effectiveTo || null,
      perTransactionLimit: ruleData.perTransactionLimit || null,
      limits: limitsToSubmit,
    };

    try {
      const res = await fetch("/api/limits", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast({ title: "Success", description: `Limit rule ${editingRule ? "updated" : "created"}.` });
      setDialogOpen(false);
      setEditingRule(null);

      try {
        const refetchRes = await fetch("/api/limits");
        const data = await refetchRes.json();
        if (Array.isArray(data)) setLimitRules(data);
      } catch {
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/limits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ruleToDelete.id }),
      });
      if (res.status !== 204) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete rule.");
      }
      setLimitRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
      toast({ title: "Rule Deleted", description: "The rule has been deleted." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error deleting rule", description: error.message });
    } finally {
      setIsSaving(false);
      setRuleToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Limits</CardTitle>
            <CardDescription>
              Manage daily, weekly, and monthly transaction limits for different customer categories.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/limits/usages">Manage Usage</Link>
            </Button>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Limit Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Category</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Aggregation</TableHead>
                  <TableHead>Service(s)</TableHead>
                  <TableHead>Global</TableHead>
                  <TableHead>Daily Limit</TableHead>
                  <TableHead>Weekly Limit</TableHead>
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead>Per-Txn Limit</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limitRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="secondary">{rule.category || "All Categories"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell>
                      <Badge variant={rule.limitAggregationType === "SERVICE_GROUP" ? "default" : "outline"}>
                        {rule.limitAggregationType || "PER_SERVICE"}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.serviceGroupDisplay || rule.serviceName || "-"}</TableCell>
                    <TableCell>{rule.isGlobal ? <Badge>Yes</Badge> : "-"}</TableCell>
                    <TableCell>{formatCurrency(rule.dailyLimit)}</TableCell>
                    <TableCell>{formatCurrency(rule.weeklyLimit)}</TableCell>
                    <TableCell>{formatCurrency(rule.monthlyLimit)}</TableCell>
                    <TableCell>{rule.perTransactionLimit != null ? formatCurrency(rule.perTransactionLimit) : "-"}</TableCell>
                    <TableCell>{rule.currency}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setRuleToDelete(rule)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
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
            <CardTitle>{editingRule ? "Edit" : "Add"} Limit Rule</CardTitle>
            <CardDescription>
              Define the limits for customer categories and transaction type. Leave category selection empty to apply as wildcard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Categories</Label>
              <div className="col-span-3 rounded-md border p-3 space-y-2 max-h-44 overflow-auto">
                {customerCategories.map((cat) => {
                  const checked = ruleData.categoryIds.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(state) => {
                          setRuleData((prev) => ({
                            ...prev,
                            categoryIds: state
                              ? [...prev.categoryIds, cat.id]
                              : prev.categoryIds.filter((id) => id !== cat.id),
                          }));
                        }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Txn Type</Label>
              <Select
                value={ruleData.transactionTypeId || "ALL"}
                onValueChange={(value) =>
                  setRuleData((prev) => ({ ...prev, transactionTypeId: value === "ALL" ? "" : value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="All Types (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Aggregation</Label>
              <Select
                value={ruleData.limitAggregationType}
                onValueChange={(value: "PER_SERVICE" | "SERVICE_GROUP") =>
                  setRuleData((prev) => ({
                    ...prev,
                    limitAggregationType: value,
                    serviceName: value === "PER_SERVICE" ? prev.serviceName : "",
                    serviceNames: value === "SERVICE_GROUP" ? prev.serviceNames : [],
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_SERVICE">PER_SERVICE</SelectItem>
                  <SelectItem value="SERVICE_GROUP">SERVICE_GROUP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {ruleData.limitAggregationType === "PER_SERVICE" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Service</Label>
                <Input
                  value={ruleData.serviceName}
                  onChange={(e) => setRuleData((prev) => ({ ...prev, serviceName: e.target.value }))}
                  className="col-span-3"
                  placeholder="Service name (optional)"
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Services</Label>
                <div className="col-span-3 rounded-md border p-3 space-y-2 max-h-44 overflow-auto">
                  {serviceOptions.map((service) => {
                    const checked = ruleData.serviceNames.includes(service.name);
                    return (
                      <label key={service.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(state) => {
                            setRuleData((prev) => ({
                              ...prev,
                              serviceNames: state
                                ? [...prev.serviceNames, service.name]
                                : prev.serviceNames.filter((name) => name !== service.name),
                            }));
                          }}
                        />
                        <span>{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Currency</Label>
              <Input
                value={ruleData.currency}
                onChange={(e) => setRuleData((prev) => ({ ...prev, currency: e.target.value }))}
                className="col-span-3"
                placeholder="ETB"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Global</Label>
              <div className="col-span-3">
                <input
                  type="checkbox"
                  checked={ruleData.isGlobal}
                  onChange={(e) => setRuleData((prev) => ({ ...prev, isGlobal: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className="ml-2 text-sm text-muted-foreground">Apply globally</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">From</Label>
              <Input
                type="datetime-local"
                value={ruleData.effectiveFrom}
                onChange={(e) => setRuleData((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">To</Label>
              <Input
                type="datetime-local"
                value={ruleData.effectiveTo}
                onChange={(e) => setRuleData((prev) => ({ ...prev, effectiveTo: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <Separator />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Per-Txn Limit</Label>
              <Input
                type="number"
                value={ruleData.perTransactionLimit}
                onChange={(e) => setRuleData((prev) => ({ ...prev, perTransactionLimit: e.target.value }))}
                className="col-span-3"
                placeholder="Max amount per single transaction (optional)"
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Limits per Interval</Label>
              {ruleData.limits.map((limit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={limit.intervalId} onValueChange={(value) => handleLimitChange(index, "intervalId", value)}>
                    <SelectTrigger className="w-1/3">
                      <SelectValue placeholder="Select Interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {intervals.map((i) => (
                        <SelectItem
                          key={i.id}
                          value={i.id}
                          disabled={ruleData.limits.some((l, idx) => l.intervalId === i.id && idx !== index)}
                        >
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Period Limit"
                    value={limit.amount}
                    onChange={(e) => handleLimitChange(index, "amount", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLimitField(index)}
                    disabled={ruleData.limits.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLimitField} disabled={ruleData.limits.length >= intervals.length}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Interval
              </Button>
            </div>
          </CardContent>
          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveRule} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </Card>
      )}
      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the limit rule for {ruleToDelete?.category} - {ruleToDelete?.transactionType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule} className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}