
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
import { Separator } from "../ui/separator";

export interface LimitRule {
    id: string;
    category: string;
    transactionType: string;
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
}

const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return 'Not Set';
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

  const [ruleData, setRuleData] = useState<{
    categoryId: string;
    transactionTypeId: string;
    limits: { intervalId: string, amount: string }[];
  }>({
    categoryId: "",
    transactionTypeId: "",
    limits: [],
  });

  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingRule(null);
    setRuleData({ categoryId: "", transactionTypeId: "", limits: [{ intervalId: "", amount: "" }] });
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

  const handleLimitChange = (index: number, field: 'intervalId' | 'amount', value: string) => {
    const newLimits = [...ruleData.limits];
    newLimits[index] = { ...newLimits[index], [field]: value };
    setRuleData(prev => ({ ...prev, limits: newLimits }));
  };
  
  const addLimitField = () => {
      setRuleData(prev => ({
          ...prev,
          limits: [...prev.limits, { intervalId: '', amount: '' }]
      }));
  };

  const removeLimitField = (index: number) => {
      if (ruleData.limits.length <= 1) return; // Prevent removing the last one
      setRuleData(prev => ({
          ...prev,
          limits: prev.limits.filter((_, i) => i !== index)
      }));
  };

  const handleSaveRule = async () => {
    if (!ruleData.categoryId || !ruleData.transactionTypeId || ruleData.limits.some(l => !l.intervalId || !l.amount)) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please select a category, transaction type, and define at least one valid interval and amount."
      });
      return;
    }

    setIsSaving(true);
    // The API expects limits as Record<string, string>
    const limitsToSubmit = ruleData.limits.reduce((acc, limit) => {
        if (limit.intervalId && limit.amount) {
            acc[limit.intervalId] = limit.amount;
        }
        return acc;
    }, {} as Record<string, string>);
    
    const payload = { 
        categoryId: ruleData.categoryId, 
        transactionTypeId: ruleData.transactionTypeId, 
        limits: limitsToSubmit 
    };

    try {
        const res = await fetch('/api/limits', {
            method: 'POST',
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
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(rule)} disabled>
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
             <Separator />
             <div className="space-y-4">
                <Label>Limits per Interval</Label>
                {ruleData.limits.map((limit, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Select
                            value={limit.intervalId}
                            onValueChange={(value) => handleLimitChange(index, 'intervalId', value)}
                        >
                            <SelectTrigger className="w-1/3">
                                <SelectValue placeholder="Select Interval" />
                            </SelectTrigger>
                            <SelectContent>
                                {intervals.map(i => (
                                    <SelectItem key={i.id} value={i.id} disabled={ruleData.limits.some((l, idx) => l.intervalId === i.id && idx !== index)}>
                                        {i.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="Limit Amount"
                            value={limit.amount}
                            onChange={(e) => handleLimitChange(index, 'amount', e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeLimitField(index)} disabled={ruleData.limits.length <= 1}>
                            <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLimitField} disabled={ruleData.limits.length >= intervals.length}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Interval
                </Button>
            </div>
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
