
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
import { Edit, PlusCircle, Trash2 } from "lucide-react";
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

interface ExceptionalLimit {
    id: string;
    accountNumber: string;
    transactionType: string;
    dailyLimit: number;
    monthlyLimit: number;
}

const initialLimits: ExceptionalLimit[] = [
  { id: 'exl1', accountNumber: '0123456789', transactionType: 'Payroll', dailyLimit: 25000000, monthlyLimit: 500000000 },
  { id: 'exl2', accountNumber: '9876543210', transactionType: 'Wire Transfer', dailyLimit: 10000000, monthlyLimit: 200000000 },
];

const transactionTypes = ["Fund Transfer", "Bill Payment", "Airtime/Data", "Bulk Payment", "Payroll", "Wire Transfer"];

const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ExceptionalLimitsPage() {
  const [limits, setLimits] = useState(initialLimits);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<ExceptionalLimit | null>(null);

  const [limitData, setLimitData] = useState({
    accountNumber: "",
    transactionType: "",
    dailyLimit: "",
    monthlyLimit: ""
  });
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingLimit(null);
    setLimitData({ accountNumber: "", transactionType: "", dailyLimit: "", monthlyLimit: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (limit: ExceptionalLimit) => {
    setEditingLimit(limit);
    setLimitData({
        accountNumber: limit.accountNumber,
        transactionType: limit.transactionType,
        dailyLimit: String(limit.dailyLimit),
        monthlyLimit: String(limit.monthlyLimit),
    });
    setDialogOpen(true);
  };

  const handleSaveLimit = () => {
    if (!limitData.accountNumber || !limitData.transactionType || !limitData.dailyLimit || !limitData.monthlyLimit) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to save the exception."
      });
      return;
    }

    if (editingLimit) {
        setLimits(prev => prev.map(l => l.id === editingLimit.id ? { 
            ...editingLimit, 
            ...limitData, 
            dailyLimit: parseFloat(limitData.dailyLimit), 
            monthlyLimit: parseFloat(limitData.monthlyLimit) 
        } : l));
        toast({
            title: "Exception Updated",
            description: "The exceptional limit has been updated successfully.",
        });
    } else {
        const newLimit: ExceptionalLimit = {
          id: `exl${Date.now()}`,
          accountNumber: limitData.accountNumber,
          transactionType: limitData.transactionType,
          dailyLimit: parseFloat(limitData.dailyLimit),
          monthlyLimit: parseFloat(limitData.monthlyLimit),
        };
        setLimits(prev => [...prev, newLimit]);
        toast({
          title: "Exception Added",
          description: "New exceptional limit has been added successfully.",
        });
    }
    
    setDialogOpen(false);
    setEditingLimit(null);
  };

  const handleDeleteLimit = (id: string) => {
    setLimits(prev => prev.filter(l => l.id !== id));
    toast({
        title: "Exception Removed",
        description: "The exceptional limit has been removed.",
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exceptional Limits</CardTitle>
            <CardDescription>Manage special transaction limits for specific corporate accounts.</CardDescription>
          </div>
          <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Exception
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Daily Limit</TableHead>
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limits.map((limit) => (
                  <TableRow key={limit.id}>
                    <TableCell className="font-mono">{limit.accountNumber}</TableCell>
                    <TableCell><Badge variant="outline">{limit.transactionType}</Badge></TableCell>
                    <TableCell>{formatCurrency(limit.dailyLimit)}</TableCell>
                    <TableCell>{formatCurrency(limit.monthlyLimit)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(limit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLimit(limit.id)} className="text-red-500 hover:text-red-600">
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
            <DialogTitle>{editingLimit ? 'Edit' : 'Add'} Exceptional Limit</DialogTitle>
            <DialogDescription>
              Set a special limit for a specific account and transaction type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-number" className="text-right">Account No.</Label>
              <Input
                id="account-number"
                value={limitData.accountNumber}
                onChange={(e) => setLimitData(prev => ({...prev, accountNumber: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 0123456789"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction-type" className="text-right">Txn Type</Label>
               <Select value={limitData.transactionType} onValueChange={(value) => setLimitData(prev => ({...prev, transactionType: value}))}>
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
                value={limitData.dailyLimit}
                onChange={(e) => setLimitData(prev => ({...prev, dailyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 25000000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly-limit" className="text-right">Monthly Limit</Label>
              <Input
                id="monthly-limit"
                type="number"
                value={limitData.monthlyLimit}
                onChange={(e) => setLimitData(prev => ({...prev, monthlyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 500000000"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveLimit}>Save Exception</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
