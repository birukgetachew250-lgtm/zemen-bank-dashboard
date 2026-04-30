
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Edit, PlusCircle, Trash2, Loader2, Search, Layers, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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

export interface ChargeTier {
    id: string;
    chargeRuleId: string;
    tierName: string | null;
    amountFrom: number;
    amountTo: number | null;
    percentage: number;
    fixedAmount: number;
    vatPercentage: number | null;
    minCharge: number | null;
    maxCharge: number | null;
    displayOrder: number;
}

export interface ChargeRule {
    id: string;
    customerCategoryId: string | null;
  customerCategoryIds?: string[];
    transactionTypeId: string | null;
  categories?: string;
    transactionType: string;
    serviceName: string | null;
    chargeType: string;
    percentage: number;
    fixedAmount: number;
    vatPercentage: number;
    disasterRiskPercentage?: number | null;
    minCharge: number | null;
    maxCharge: number | null;
    effectiveFrom: string | null;
    effectiveTo: string | null;
}

export interface DropdownItem {
    id: string;
    name: string;
}

const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ChargeManagementClientProps {
    initialChargeRules: ChargeRule[];
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
    if (["category", "type", "service", "charge"].includes(key) && value) {
      advanced[key] = value;
    } else {
      freeText.push(token);
    }
  }

  return { advanced, freeText: freeText.join(" ").toLowerCase() };
}

export function ChargeManagementClient({ initialChargeRules }: ChargeManagementClientProps) {
  const [chargeRules, setChargeRules] = useState<ChargeRule[]>(initialChargeRules);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL");
  const [chargeTypeFilter, setChargeTypeFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<ChargeRule | null>(null);

  const { toast } = useToast();

  const categoryOptions = useMemo(
    () => Array.from(new Set(chargeRules.map((r) => r.categories || "All Categories"))).sort(),
    [chargeRules]
  );

  const transactionTypeOptions = useMemo(
    () => Array.from(new Set(chargeRules.map((r) => r.transactionType || "All Types"))).sort(),
    [chargeRules]
  );

  const filteredRules = useMemo(() => {
    const { advanced, freeText } = parseAdvancedQuery(searchTerm);
    const serviceTerm = serviceFilter.trim().toLowerCase();

    return chargeRules.filter((r) => {
      const categories = (r.categories || "All Categories").toLowerCase();
      const type = (r.transactionType || "All Types").toLowerCase();
      const service = (r.serviceName || "").toLowerCase();
      const chargeType = (r.chargeType || "FLAT").toLowerCase();

      if (categoryFilter !== "ALL" && (r.categories || "All Categories") !== categoryFilter) return false;
      if (transactionTypeFilter !== "ALL" && (r.transactionType || "All Types") !== transactionTypeFilter) return false;
      if (chargeTypeFilter !== "ALL" && (r.chargeType || "FLAT") !== chargeTypeFilter) return false;
      if (serviceTerm && !service.includes(serviceTerm)) return false;

      if (advanced.category && !categories.includes(advanced.category)) return false;
      if (advanced.type && !type.includes(advanced.type)) return false;
      if (advanced.service && !service.includes(advanced.service)) return false;
      if (advanced.charge && !chargeType.includes(advanced.charge)) return false;

      if (!freeText) return true;

      return (
        categories.includes(freeText) ||
        type.includes(freeText) ||
        service.includes(freeText) ||
        chargeType.includes(freeText)
      );
    });
  }, [chargeRules, searchTerm, categoryFilter, transactionTypeFilter, chargeTypeFilter, serviceFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setTransactionTypeFilter("ALL");
    setChargeTypeFilter("ALL");
    setServiceFilter("");
  };

  const handleDeleteRule = async () => {
      if (!ruleToDelete) return;
      setIsSaving(true);
      try {
          const res = await fetch('/api/charges', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: ruleToDelete.id })
          });
          if (res.status !== 204) throw new Error((await res.json()).message || 'Failed to delete');

          setChargeRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
          toast({ title: "Rule Deleted", description: "The charge rule has been deleted."});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error deleting rule', description: error.message });
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
            <CardTitle>Transaction Charges</CardTitle>
            <CardDescription>
              Cleaner charge list with advanced filtering. Disaster Risk Levy is mandatory on every transaction.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Advanced search: category:GOLD type:TRANSFER service:TELEBIRR charge:FLAT"
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
            <Select value={chargeTypeFilter} onValueChange={setChargeTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Charges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Charges</SelectItem>
                <SelectItem value="FLAT">FLAT</SelectItem>
                <SelectItem value="TIERED">TIERED</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Service contains..."
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-[180px]"
            />
            <Button variant="outline" onClick={clearFilters}>
              <FilterX className="h-4 w-4 mr-2" /> Clear
            </Button>
            <Button asChild>
              <Link href="/charges/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Charge Rule
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
                  <TableHead>Service</TableHead>
                  <TableHead>Charge Type</TableHead>
                  <TableHead>Pricing Summary</TableHead>
                  <TableHead>Disaster Risk</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No charge rules found.</TableCell>
                  </TableRow>
                ) : filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="secondary">{rule.categories || 'All Categories'}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell>{rule.serviceName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={rule.chargeType === 'TIERED' ? 'default' : 'outline'}>{rule.chargeType || 'FLAT'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div>{rule.percentage ? `${rule.percentage}%` : '-'} + {rule.fixedAmount ? formatCurrency(rule.fixedAmount) : '-'}</div>
                        <div className="text-muted-foreground">VAT {rule.vatPercentage}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        Mandatory {rule.disasterRiskPercentage != null ? `(${rule.disasterRiskPercentage}%)` : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {rule.chargeType === 'TIERED' && (
                        <Button variant="ghost" size="icon" title="Manage Tiers" asChild>
                          <Link href={`/charges/${rule.id}/tiers`}>
                            <Layers className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                       <Button variant="ghost" size="icon" asChild>
                        <Link href={`/charges/${rule.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setRuleToDelete(rule)}>
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

      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the charge rule for {ruleToDelete?.categories || 'All Categories'} - {ruleToDelete?.transactionType}.
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
