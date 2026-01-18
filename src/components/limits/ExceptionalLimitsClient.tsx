
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
import type { ExceptionalLimit } from "@/app/(main)/limits/exceptional-limits/page";

interface ExceptionalLimitsClientProps {
    initialItems: ExceptionalLimit[];
}

const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'Not Set';
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export function ExceptionalLimitsClient({ initialItems }: ExceptionalLimitsClientProps) {
  const [limits, setLimits] = useState<ExceptionalLimit[]>(initialItems);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLimit, setEditingLimit] = useState<ExceptionalLimit | null>(null);
  const [limitToDelete, setLimitToDelete] = useState<ExceptionalLimit | null>(null);

  const [limitData, setLimitData] = useState({
    accountNumber: "",
    additionalDailyLimit: "",
    additionalWeeklyLimit: "",
    additionalMonthlyLimit: "",
    reason: "",
  });
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingLimit(null);
    setLimitData({ accountNumber: "", additionalDailyLimit: "", additionalWeeklyLimit: "", additionalMonthlyLimit: "", reason: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (limit: ExceptionalLimit) => {
    setEditingLimit(limit);
    setLimitData({
        accountNumber: limit.accountNumber,
        additionalDailyLimit: limit.additionalDailyLimit?.toString() || "",
        additionalWeeklyLimit: limit.additionalWeeklyLimit?.toString() || "",
        additionalMonthlyLimit: limit.additionalMonthlyLimit?.toString() || "",
        reason: limit.reason || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!limitData.accountNumber) {
      toast({
        variant: "destructive",
        title: "Missing Field",
        description: "Account Number is required."
      });
      return;
    }

    setIsSaving(true);
    const method = editingLimit ? 'PUT' : 'POST';
    const payload = {
        id: editingLimit?.id,
        ...limitData,
    };

    try {
        const res = await fetch('/api/limits/exceptions', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        if (editingLimit) {
            setLimits(prev => prev.map(l => l.id === editingLimit.id ? result : l));
            toast({ title: "Exception Updated", description: "The exceptional limit has been updated successfully." });
        } else {
            setLimits(prev => [result, ...prev]);
            toast({ title: "Exception Added", description: "New exceptional limit has been added successfully." });
        }
        
        setDialogOpen(false);
        setEditingLimit(null);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
      if (!limitToDelete) return;
      setIsSaving(true);
      try {
          const res = await fetch('/api/limits/exceptions', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: limitToDelete.id })
          });
          if (res.status !== 204) throw new Error((await res.json()).message || 'Failed to delete');

          setLimits(prev => prev.filter(r => r.id !== limitToDelete.id));
          toast({ title: "Exception Removed", description: "The exceptional limit has been deleted."});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error deleting exception', description: error.message });
      } finally {
          setIsSaving(false);
          setLimitToDelete(null);
      }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exceptional Limits</CardTitle>
            <CardDescription>Manage specific, one-off limit exceptions for individual accounts.</CardDescription>
          </div>
          <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exception
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Additional Daily Limit</TableHead>
                  <TableHead>Additional Weekly Limit</TableHead>
                  <TableHead>Additional Monthly Limit</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((limit) => (
                  <TableRow key={limit.id}>
                    <TableCell className="font-mono">{limit.accountNumber}</TableCell>
                    <TableCell>{formatCurrency(limit.additionalDailyLimit)}</TableCell>
                    <TableCell>{formatCurrency(limit.additionalWeeklyLimit)}</TableCell>
                    <TableCell>{formatCurrency(limit.additionalMonthlyLimit)}</TableCell>
                    <TableCell>{limit.reason}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(limit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setLimitToDelete(limit)}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLimit ? 'Edit' : 'Add'} Exceptional Limit</DialogTitle>
            <DialogDescription>
              Provide additional limits for a specific account. Leave fields blank to not set a specific additional limit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" value={limitData.accountNumber} onChange={e => setLimitData(p => ({...p, accountNumber: e.target.value}))}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="dailyLimit">Additional Daily Limit</Label>
                <Input id="dailyLimit" type="number" placeholder="e.g. 50000" value={limitData.additionalDailyLimit} onChange={e => setLimitData(p => ({...p, additionalDailyLimit: e.target.value}))}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="weeklyLimit">Additional Weekly Limit</Label>
                <Input id="weeklyLimit" type="number" placeholder="e.g. 200000" value={limitData.additionalWeeklyLimit} onChange={e => setLimitData(p => ({...p, additionalWeeklyLimit: e.target.value}))}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Additional Monthly Limit</Label>
                <Input id="monthlyLimit" type="number" placeholder="e.g. 500000" value={limitData.additionalMonthlyLimit} onChange={e => setLimitData(p => ({...p, additionalMonthlyLimit: e.target.value}))}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason for Exception</Label>
                <Input id="reason" value={limitData.reason} onChange={e => setLimitData(p => ({...p, reason: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!limitToDelete} onOpenChange={(open) => !open && setLimitToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the exceptional limit for account {limitToDelete?.accountNumber}.
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
