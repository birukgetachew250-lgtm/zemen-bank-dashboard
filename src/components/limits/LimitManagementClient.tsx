
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
import { DropdownItem } from "../charges/ChargeManagementClient";
import type { Interval } from "@/app/(main)/limits/page";

export interface LimitRule {
    id: string;
    category: string;
    transactionType: string;
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
}

const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface LimitManagementClientProps {
    initialLimitRules: LimitRule[];
    customerCategories: DropdownItem[];
    transactionTypes: DropdownItem[];
    intervals: Interval[];
}

export function LimitManagementClient({ initialLimitRules, customerCategories, transactionTypes, intervals }: LimitManagementClientProps) {
  const [limitRules, setLimitRules] = useState<LimitRule[]>(initialLimitRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<LimitRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<LimitRule | null>(null);

  const [ruleData, setRuleData] = useState({
    categoryId: "",
    transactionTypeId: "",
    limits: {} as Record<string, string>,
  });
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingRule(null);
    const initialLimits = intervals.reduce((acc, interval) => ({ ...acc, [interval.id]: '' }), {});
    setRuleData({ categoryId: "", transactionTypeId: "", limits: initialLimits });
    setDialogOpen(true);
  };
  
  const openEditDialog = (rule: LimitRule) => {
    setEditingRule(rule);
    // For now, editing is disabled because it requires fetching detailed interval data which is complex with the current setup.
    // A proper implementation would fetch the specific rule's interval amounts.
    toast({
        variant: "destructive",
        title: "Editing Not Implemented",
        description: "Editing rules is not supported in this version. Please delete and recreate the rule.",
    });
  };

  const handleLimitChange = (intervalId: string, value: string) => {
      setRuleData(prev => ({
          ...prev,
          limits: {
              ...prev.limits,
              [intervalId]: value,
          }
      }))
  };

  const handleSaveRule = async () => {
    if (!ruleData.categoryId || !ruleData.transactionTypeId || Object.values(ruleData.limits).some(v => v === '')) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please select a category, transaction type, and fill out all limit fields."
      });
      return;
    }

    setIsSaving(true);
    const method = editingRule ? 'PUT' : 'POST';
    const payload = editingRule 
        ? { id: editingRule.id, ...ruleData } 
        : { categoryId: ruleData.categoryId, transactionTypeId: ruleData.transactionTypeId, limits: ruleData.limits };

    try {
        const res = await fetch('/api/limits', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        toast({ title: "Success", description: `Limit rule ${editingRule ? 'updated' : 'created'}.` });
        setDialogOpen(false);
        setEditingRule(null);
        window.location.reload(); // Simple refresh to show new data
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
          const res = await fetch('/api/limits', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: ruleToDelete.id })
          });
          if (res.status !== 204) {
              const errorText = await res.text();
              throw new Error(errorText || 'Failed to delete rule.');
          }
          setLimitRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
          toast({ title: "Rule Deleted", description: "The rule has been deleted."});
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
            <CardTitle>Transaction Limits</CardTitle>
            <CardDescription>Manage daily, weekly, and monthly transaction limits for different customer categories.</CardDescription>
          </div>
          <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Limit Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Category</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Daily Limit</TableHead>
                  <TableHead>Weekly Limit</TableHead>
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limitRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant={rule.category === 'Retail' ? 'secondary' : rule.category === 'Premium' ? 'default' : 'outline'}>
                        {rule.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell>{formatCurrency(rule.dailyLimit)}</TableCell>
                    <TableCell>{formatCurrency(rule.weeklyLimit)}</TableCell>
                    <TableCell>{formatCurrency(rule.monthlyLimit)}</TableCell>
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

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Add'} Limit Rule</DialogTitle>
            <DialogDescription>
              Define the limits for a customer category and transaction type. Click save when you're done.
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
            {intervals.map(interval => (
                 <div key={interval.id} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`limit-${interval.id}`} className="text-right">{interval.name} Limit</Label>
                    <Input
                        id={`limit-${interval.id}`}
                        type="number"
                        value={ruleData.limits[interval.id] || ''}
                        onChange={(e) => handleLimitChange(interval.id, e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. 100000"
                    />
                </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveRule} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
