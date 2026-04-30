"use client";

import { useMemo, useState } from "react";
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
import { Edit, PlusCircle, Trash2, Loader2, Search, FilterX, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
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
}

function parseAdvancedQuery(query: string) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const advanced: Record<string, string> = {};
  const freeText: string[] = [];

  for (const token of tokens) {
    const [rawKey, ...valueParts] = token.split(":");
    if (!rawKey || valueParts.length === 0) {
      freeText.push(token);
      continue;
    }
    const key = rawKey.toLowerCase();
    const value = valueParts.join(":").toLowerCase();
    if (["category", "type", "service", "aggregation"].includes(key) && value) {
      advanced[key] = value;
    } else {
      freeText.push(token);
    }
  }

  return { advanced, freeText: freeText.join(" ").toLowerCase() };
}

export function LimitManagementClient({
  initialLimitRules,
}: LimitManagementClientProps) {
  const [limitRules, setLimitRules] = useState<LimitRule[]>(initialLimitRules);
  const [isSaving, setIsSaving] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<LimitRule | null>(null);
  const [viewingRule, setViewingRule] = useState<LimitRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL");
  const [aggregationFilter, setAggregationFilter] = useState("ALL");

  const { toast } = useToast();

  const categoryOptions = useMemo(
    () => Array.from(new Set(limitRules.map((r) => r.category || "All Categories"))).sort(),
    [limitRules]
  );

  const transactionTypeOptions = useMemo(
    () => Array.from(new Set(limitRules.map((r) => r.transactionType || "All Types"))).sort(),
    [limitRules]
  );

  const filteredRules = useMemo(() => {
    const { advanced, freeText } = parseAdvancedQuery(searchTerm);

    return limitRules.filter((rule) => {
      const category = (rule.category || "All Categories").toLowerCase();
      const type = (rule.transactionType || "All Types").toLowerCase();
      const aggregation = (rule.limitAggregationType || "PER_SERVICE").toLowerCase();
      const service = (rule.serviceGroupDisplay || rule.serviceName || "").toLowerCase();

      if (categoryFilter !== "ALL" && (rule.category || "All Categories") !== categoryFilter) return false;
      if (transactionTypeFilter !== "ALL" && (rule.transactionType || "All Types") !== transactionTypeFilter) return false;
      if (aggregationFilter !== "ALL" && (rule.limitAggregationType || "PER_SERVICE") !== aggregationFilter) return false;

      if (advanced.category && !category.includes(advanced.category)) return false;
      if (advanced.type && !type.includes(advanced.type)) return false;
      if (advanced.aggregation && !aggregation.includes(advanced.aggregation)) return false;
      if (advanced.service && !service.includes(advanced.service)) return false;

      if (!freeText) return true;

      return category.includes(freeText) || type.includes(freeText) || aggregation.includes(freeText) || service.includes(freeText);
    });
  }, [limitRules, searchTerm, categoryFilter, transactionTypeFilter, aggregationFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setTransactionTypeFilter("ALL");
    setAggregationFilter("ALL");
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
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Advanced search: category:RETAIL type:TRANSFER service:TELEBIRR aggregation:PER_SERVICE"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[420px]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categoryOptions.map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {transactionTypeOptions.map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={aggregationFilter} onValueChange={setAggregationFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="All Aggregation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Aggregation</SelectItem>
                <SelectItem value="PER_SERVICE">PER_SERVICE</SelectItem>
                <SelectItem value="SERVICE_GROUP">SERVICE_GROUP</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button variant="outline" asChild>
              <Link href="/limits/usages">Manage Usage</Link>
            </Button>
            <Button asChild>
              <Link href="/limits/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Limit Rule
              </Link>
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
                  <TableHead>Limits Summary</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
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
                    <TableCell className="text-sm">
                      <div>D: {formatCurrency(rule.dailyLimit)}</div>
                      <div>W: {formatCurrency(rule.weeklyLimit)}</div>
                      <div>M: {formatCurrency(rule.monthlyLimit)}</div>
                      <div>P: {rule.perTransactionLimit != null ? formatCurrency(rule.perTransactionLimit) : "-"}</div>
                      <div className="text-muted-foreground">Global: {rule.isGlobal ? "Yes" : "No"}</div>
                    </TableCell>
                    <TableCell>{rule.currency}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setViewingRule(rule)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/limits/${rule.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
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
      <AlertDialog open={!!viewingRule} onOpenChange={(open) => !open && setViewingRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limit Rule Details</AlertDialogTitle>
            <AlertDialogDescription>
              Full details for {viewingRule?.category || "All Categories"} - {viewingRule?.transactionType || "All Types"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Category:</span> {viewingRule?.category || '-'}</div>
            <div><span className="text-muted-foreground">Transaction Type:</span> {viewingRule?.transactionType || '-'}</div>
            <div><span className="text-muted-foreground">Aggregation:</span> {viewingRule?.limitAggregationType || 'PER_SERVICE'}</div>
            <div><span className="text-muted-foreground">Service(s):</span> {viewingRule?.serviceGroupDisplay || viewingRule?.serviceName || '-'}</div>
            <div><span className="text-muted-foreground">Global:</span> {viewingRule?.isGlobal ? 'Yes' : 'No'}</div>
            <div><span className="text-muted-foreground">Currency:</span> {viewingRule?.currency || '-'}</div>
            <div><span className="text-muted-foreground">Daily:</span> {viewingRule ? formatCurrency(viewingRule.dailyLimit) : '-'}</div>
            <div><span className="text-muted-foreground">Weekly:</span> {viewingRule ? formatCurrency(viewingRule.weeklyLimit) : '-'}</div>
            <div><span className="text-muted-foreground">Monthly:</span> {viewingRule ? formatCurrency(viewingRule.monthlyLimit) : '-'}</div>
            <div><span className="text-muted-foreground">Per Transaction:</span> {viewingRule?.perTransactionLimit != null ? formatCurrency(viewingRule.perTransactionLimit) : '-'}</div>
            <div><span className="text-muted-foreground">Effective From:</span> {viewingRule?.effectiveFrom ? new Date(viewingRule.effectiveFrom).toLocaleString() : '-'}</div>
            <div><span className="text-muted-foreground">Effective To:</span> {viewingRule?.effectiveTo ? new Date(viewingRule.effectiveTo).toLocaleString() : '-'}</div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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