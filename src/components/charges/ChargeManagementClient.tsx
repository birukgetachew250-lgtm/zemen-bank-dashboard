
"use client";

import { useState } from "react";
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
import { Edit, PlusCircle, Trash2, Loader2 } from "lucide-react";
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
    category: string;
    transactionType: string;
    chargeType: 'Percentage' | 'Fixed';
    value: number;
}

export interface DropdownItem {
    id: string;
    name: string;
}

interface ChargeManagementClientProps {
    initialChargeRules: ChargeRule[];
    customerCategories: DropdownItem[];
    transactionTypes: DropdownItem[];
}

export function ChargeManagementClient({ initialChargeRules, customerCategories, transactionTypes }: ChargeManagementClientProps) {
  const [chargeRules, setChargeRules] = useState<ChargeRule[]>(initialChargeRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<ChargeRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<ChargeRule | null>(null);

  const [ruleData, setRuleData] = useState({
    categoryId: "",
    transactionTypeId: "",
    chargeType: "Percentage",
    value: ""
  });
  const { toast } = useToast();

  const formatValue = (rule: ChargeRule) => {
    if (rule.chargeType === 'Percentage') {
        return `${rule.value}%`;
    }
    return `ETB ${rule.value.toLocaleString()}`;
  }

  const openAddDialog = () => {
    setEditingRule(null);
    setRuleData({ categoryId: "", transactionTypeId: "", chargeType: "Percentage", value: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (rule: ChargeRule) => {
    setEditingRule(rule);
    const categoryId = customerCategories.find(c => c.name === rule.category)?.id || "";
    const transactionTypeId = transactionTypes.find(t => t.name === rule.transactionType)?.id || "";
    setRuleData({
        categoryId,
        transactionTypeId,
        chargeType: rule.chargeType,
        value: String(rule.value)
    });
    setDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!ruleData.categoryId || !ruleData.transactionTypeId || !ruleData.value) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to save the charge rule."
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
          <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Charge Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Category</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Charge Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargeRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="secondary">{rule.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell><Badge variant="outline">{rule.chargeType}</Badge></TableCell>
                    <TableCell>{formatValue(rule)}</TableCell>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Add'} Charge Rule</DialogTitle>
            <DialogDescription>
              Define the charge for a specific transaction and customer type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={ruleData.categoryId} onValueChange={(value) => setRuleData(prev => ({...prev, categoryId: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {customerCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction-type" className="text-right">Txn Type</Label>
               <Select value={ruleData.transactionTypeId} onValueChange={(value) => setRuleData(prev => ({...prev, transactionTypeId: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                    {transactionTypes.map(type => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">Charge Type</Label>
                <Select value={ruleData.chargeType} onValueChange={(value) => setRuleData(prev => ({...prev, chargeType: value as 'Percentage' | 'Fixed'}))}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="Fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value {ruleData.chargeType === 'Percentage' ? '(%)' : '(ETB)'}
              </Label>
              <Input
                id="value"
                type="number"
                value={ruleData.value}
                onChange={(e) => setRuleData(prev => ({...prev, value: e.target.value}))}
                className="col-span-3"
                placeholder={ruleData.chargeType === 'Percentage' ? "e.g. 0.5" : "e.g. 10.00"}
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
