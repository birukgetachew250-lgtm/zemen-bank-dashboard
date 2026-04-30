"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectSearch } from "@/components/ui/multi-select-search";
import { useToast } from "@/hooks/use-toast";
import type { DropdownItem } from "@/components/charges/ChargeManagementClient";
import type { Interval } from "@/app/(main)/limits/page";

interface LimitRuleFormData {
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
}

interface LimitRuleInitialData {
  id: string;
  categoryIds: string[];
  transactionTypeId: string | null;
  serviceName: string | null;
  limitAggregationType: "PER_SERVICE" | "SERVICE_GROUP";
  serviceNames: string[];
  isGlobal: boolean;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
  perTransactionLimit: string;
  limits: { intervalId: string; amount: string }[];
}

interface LimitRuleFormClientProps {
  mode: "create" | "edit";
  customerCategories: DropdownItem[];
  transactionTypes: DropdownItem[];
  intervals: Interval[];
  serviceOptions: DropdownItem[];
  initialData?: LimitRuleInitialData;
}

export function LimitRuleFormClient({
  mode,
  customerCategories,
  transactionTypes,
  intervals,
  serviceOptions,
  initialData,
}: LimitRuleFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [ruleData, setRuleData] = useState<LimitRuleFormData>(() => {
    if (initialData) {
      return {
        categoryIds: initialData.categoryIds,
        transactionTypeId: initialData.transactionTypeId || "",
        serviceName: initialData.serviceName || "",
        limitAggregationType: initialData.limitAggregationType || "PER_SERVICE",
        serviceNames: initialData.serviceNames,
        isGlobal: initialData.isGlobal,
        currency: initialData.currency || "ETB",
        effectiveFrom: initialData.effectiveFrom,
        effectiveTo: initialData.effectiveTo,
        perTransactionLimit: initialData.perTransactionLimit,
        limits: initialData.limits.length > 0 ? initialData.limits : [{ intervalId: "", amount: "" }],
      };
    }

    return {
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
    };
  });

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

  const handleSave = async () => {
    if (ruleData.limits.some((l) => !l.intervalId || !l.amount)) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please define at least one valid interval and amount.",
      });
      return;
    }

    if (ruleData.limitAggregationType === "SERVICE_GROUP" && ruleData.serviceNames.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing services",
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

    const payload = {
      id: initialData?.id,
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
      const response = await fetch("/api/limits", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save limit rule");

      toast({ title: mode === "edit" ? "Limit rule updated" : "Limit rule created" });
      router.push("/limits");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Unable to save limit rule.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>{mode === "edit" ? "Edit Limit Rule" : "Add Limit Rule"}</CardTitle>
            <CardDescription>
              Configure limit rule details in a dedicated page for easier management.
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/limits">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Limits
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 py-2">
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">Categories</Label>
          <div className="col-span-3">
            <MultiSelectSearch
              options={customerCategories.map((cat) => ({ id: cat.id, label: cat.name }))}
              selectedIds={ruleData.categoryIds}
              onChange={(ids) => setRuleData((prev) => ({ ...prev, categoryIds: ids }))}
              placeholder="All Categories (wildcard)"
              searchPlaceholder="Search categories..."
              emptyText="No categories found."
            />
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
            <div className="col-span-3">
              <MultiSelectSearch
                options={serviceOptions.map((service) => ({ id: service.name, label: service.name }))}
                selectedIds={ruleData.serviceNames}
                onChange={(ids) => setRuleData((prev) => ({ ...prev, serviceNames: ids }))}
                placeholder="Select group services"
                searchPlaceholder="Search services..."
                emptyText="No services found."
              />
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

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/limits">Cancel</Link>
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Update Limit Rule" : "Create Limit Rule"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
