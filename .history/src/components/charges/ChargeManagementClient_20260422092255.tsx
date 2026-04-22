
"use client";

import { useState, useMemo } from "react";
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
import { Edit, PlusCircle, Trash2, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface ChargeRule {
    id: string;
    customerCategoryId: string | null;
    transactionTypeId: string | null;
    category: string;
    transactionType: string;
    serviceName: string | null;
    percentage: number;
    fixedAmount: number;
    vatPercentage: number;
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
    customerCategories: DropdownItem[];
    transactionTypes: DropdownItem[];
}

export function ChargeManagementClient({ initialChargeRules, customerCategories, transactionTypes }: ChargeManagementClientProps) {
  const [chargeRules, setChargeRules] = useState<ChargeRule[]>(initialChargeRules);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<ChargeRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<ChargeRule | null>(null);

  const [ruleData, setRuleData] = useState({
    categoryId: "",
    transactionTypeId: "",
    serviceName: "",
    percentage: "",
    fixedAmount: "",
    vatPercentage: "15",
    minCharge: "",
    maxCharge: "",
    effectiveFrom: "",
    effectiveTo: "",
  });
  const { toast } = useToast();

  const filteredRules = useMemo(() => {
    if (!searchTerm.trim()) return chargeRules;
    const term = searchTerm.toLowerCase();
    return chargeRules.filter(
      (r) =>
        r.category.toLowerCase().includes(term) ||
        r.transactionType.toLowerCase().includes(term) ||
        (r.serviceName || "").toLowerCase().includes(term)
    );
  }, [chargeRules, searchTerm]);

  const openAddDialog = () => {
    setEditingRule(null);
    setRuleData({ categoryId: "", transactionTypeId: "", serviceName: "", percentage: "", fixedAmount: "", vatPercentage: "15", minCharge: "", maxCharge: "", effectiveFrom: "", effectiveTo: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (rule: ChargeRule) => {
    setEditingRule(rule);
    setRuleData({
        categoryId: rule.customerCategoryId || "",
        transactionTypeId: rule.transactionTypeId || "",
        serviceName: rule.serviceName || "",
        percentage: String(rule.percentage || ""),
        fixedAmount: String(rule.fixedAmount || ""),
        vatPercentage: String(rule.vatPercentage ?? 15),
        minCharge: rule.minCharge !== null ? String(rule.minCharge) : "",
        maxCharge: rule.maxCharge !== null ? String(rule.maxCharge) : "",
        effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom).toISOString().slice(0, 16) : "",
        effectiveTo: rule.effectiveTo ? new Date(rule.effectiveTo).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!ruleData.percentage && !ruleData.fixedAmount) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please provide at least a percentage or fixed amount."
      });
      return;
    }

    setIsSaving(true);
    const method = editingRule ? 'PUT' : 'POST';
    const payload = {
        id: editingRule?.id,
        ...ruleData,
    };

    try {
        const res = await fetch('/api/charges', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        if (editingRule) {
            setChargeRules(prev => prev.map(r => r.id === editingRule.id ? result : r));
            toast({ title: "Rule Updated", description: "The transaction charge rule has been updated successfully." });
        } else {
            setChargeRules(prev => [...prev, result]);
            toast({ title: "Rule Added", description: "New transaction charge rule has been added successfully." });
        }
        
        setDialogOpen(false);
        setEditingRule(null);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSaving(false);
    }
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
            <CardDescription>Manage percentage-based or fixed charges for different transactions.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search category, type, service…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Charge Rule
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
                  <TableHead>Percentage</TableHead>
                  <TableHead>Fixed Amount</TableHead>
                  <TableHead>VAT %</TableHead>
                  <TableHead>Min Charge</TableHead>
                  <TableHead>Max Charge</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No charge rules found.</TableCell>
                  </TableRow>
                ) : filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="secondary">{rule.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell>{rule.serviceName || '-'}</TableCell>
                    <TableCell>{rule.percentage ? `${rule.percentage}%` : '-'}</TableCell>
                    <TableCell>{rule.fixedAmount ? formatCurrency(rule.fixedAmount) : '-'}</TableCell>
                    <TableCell>{rule.vatPercentage}%</TableCell>
                    <TableCell>{formatCurrency(rule.minCharge)}</TableCell>
                    <TableCell>{formatCurrency(rule.maxCharge)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(rule)}>
                        <Edit className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Add'} Charge Rule</DialogTitle>
            <DialogDescription>
              Define the charge for a specific transaction and customer type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Category</Label>
              <Select value={ruleData.categoryId} onValueChange={(value) => setRuleData(prev => ({...prev, categoryId: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All Categories (optional)" />
                </SelectTrigger>
                <SelectContent>
                    {customerCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Txn Type</Label>
               <Select value={ruleData.transactionTypeId} onValueChange={(value) => setRuleData(prev => ({...prev, transactionTypeId: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All Types (optional)" />
                </SelectTrigger>
                <SelectContent>
                    {transactionTypes.map(type => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Service</Label>
              <Input
                value={ruleData.serviceName}
                onChange={(e) => setRuleData(prev => ({...prev, serviceName: e.target.value}))}
                className="col-span-3"
                placeholder="Service name (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Percentage</Label>
              <Input
                type="number"
                value={ruleData.percentage}
                onChange={(e) => setRuleData(prev => ({...prev, percentage: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 0.5"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fixed Amt</Label>
              <Input
                type="number"
                value={ruleData.fixedAmount}
                onChange={(e) => setRuleData(prev => ({...prev, fixedAmount: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 10.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">VAT %</Label>
              <Input
                type="number"
                value={ruleData.vatPercentage}
                onChange={(e) => setRuleData(prev => ({...prev, vatPercentage: e.target.value}))}
                className="col-span-3"
                placeholder="15"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Min Charge</Label>
              <Input
                type="number"
                value={ruleData.minCharge}
                onChange={(e) => setRuleData(prev => ({...prev, minCharge: e.target.value}))}
                className="col-span-3"
                placeholder="Min charge (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Max Charge</Label>
              <Input
                type="number"
                value={ruleData.maxCharge}
                onChange={(e) => setRuleData(prev => ({...prev, maxCharge: e.target.value}))}
                className="col-span-3"
                placeholder="Max charge (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Effective From</Label>
              <Input
                type="datetime-local"
                value={ruleData.effectiveFrom}
                onChange={(e) => setRuleData(prev => ({...prev, effectiveFrom: e.target.value}))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Effective To</Label>
              <Input
                type="datetime-local"
                value={ruleData.effectiveTo}
                onChange={(e) => setRuleData(prev => ({...prev, effectiveTo: e.target.value}))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveRule} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the charge rule for {ruleToDelete?.category} - {ruleToDelete?.transactionType}.
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
