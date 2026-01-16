
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

export interface LimitRule {
    id: string;
    category: string;
    transactionType: string;
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
}

const customerCategories = ["Retail", "Premium", "Corporate"];
const transactionTypes = ["Fund Transfer", "Bill Payment", "Airtime/Data", "Bulk Payment"];

const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface LimitManagementClientProps {
    initialLimitRules: LimitRule[];
}

export function LimitManagementClient({ initialLimitRules }: LimitManagementClientProps) {
  const [limitRules, setLimitRules] = useState<LimitRule[]>(initialLimitRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<LimitRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<LimitRule | null>(null);

  const [ruleData, setRuleData] = useState({
    category: "",
    transactionType: "",
    dailyLimit: "",
    weeklyLimit: "",
    monthlyLimit: ""
  });
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingRule(null);
    setRuleData({ category: "", transactionType: "", dailyLimit: "", weeklyLimit: "", monthlyLimit: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (rule: LimitRule) => {
    setEditingRule(rule);
    setRuleData({
        category: rule.category,
        transactionType: rule.transactionType,
        dailyLimit: String(rule.dailyLimit),
        weeklyLimit: String(rule.weeklyLimit),
        monthlyLimit: String(rule.monthlyLimit),
    });
    setDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!ruleData.category || !ruleData.transactionType || !ruleData.dailyLimit || !ruleData.weeklyLimit || !ruleData.monthlyLimit) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to save the rule."
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
        const res = await fetch('/api/limits', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        if (editingRule) {
            setLimitRules(prev => prev.map(r => r.id === editingRule.id ? result : r));
            toast({ title: "Rule Updated", description: "The transaction limit rule has been updated successfully." });
        } else {
            setLimitRules(prev => [...prev, result]);
            toast({ title: "Rule Added", description: "New transaction limit rule has been added successfully." });
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
          toast({ title: "Rule Deleted", description: "The rule has been deleted." });
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Add'} Limit Rule</DialogTitle>
            <DialogDescription>
              Define the limits for a customer category and transaction type. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={ruleData.category} onValueChange={(value) => setRuleData(prev => ({...prev, category: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {customerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction-type" className="text-right">Txn Type</Label>
               <Select value={ruleData.transactionType} onValueChange={(value) => setRuleData(prev => ({...prev, transactionType: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                    {transactionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="daily-limit" className="text-right">Daily Limit</Label>
              <Input
                id="daily-limit"
                type="number"
                value={ruleData.dailyLimit}
                onChange={(e) => setRuleData(prev => ({...prev, dailyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 100000"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weekly-limit" className="text-right">Weekly Limit</Label>
              <Input
                id="weekly-limit"
                type="number"
                value={ruleData.weeklyLimit}
                onChange={(e) => setRuleData(prev => ({...prev, weeklyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 500000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly-limit" className="text-right">Monthly Limit</Label>
              <Input
                id="monthly-limit"
                type="number"
                value={ruleData.monthlyLimit}
                onChange={(e) => setRuleData(prev => ({...prev, monthlyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 1000000"
              />
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
