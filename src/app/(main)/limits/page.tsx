
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
import { Edit, PlusCircle } from "lucide-react";
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

const initialLimitRules = [
  { id: 'lim1', category: 'Retail', transactionType: 'Fund Transfer', dailyLimit: 100000, monthlyLimit: 1000000 },
  { id: 'lim2', category: 'Retail', transactionType: 'Bill Payment', dailyLimit: 50000, monthlyLimit: 500000 },
  { id: 'lim3', category: 'Retail', transactionType: 'Airtime/Data', dailyLimit: 10000, monthlyLimit: 100000 },
  { id: 'lim4', category: 'Premium', transactionType: 'Fund Transfer', dailyLimit: 500000, monthlyLimit: 5000000 },
  { id: 'lim5', category: 'Premium', transactionType: 'Bill Payment', dailyLimit: 200000, monthlyLimit: 2000000 },
  { id: 'lim6', category: 'Corporate', transactionType: 'Bulk Payment', dailyLimit: 10000000, monthlyLimit: 250000000 },
  { id: 'lim7', category: 'Corporate', transactionType: 'Fund Transfer', dailyLimit: 5000000, monthlyLimit: 100000000 },
];

const customerCategories = ["Retail", "Premium", "Corporate"];
const transactionTypes = ["Fund Transfer", "Bill Payment", "Airtime/Data", "Bulk Payment"];

const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function LimitsPage() {
  const [limitRules, setLimitRules] = useState(initialLimitRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    category: "",
    transactionType: "",
    dailyLimit: "",
    monthlyLimit: ""
  });
  const { toast } = useToast();

  const handleAddRule = () => {
    if (!newRule.category || !newRule.transactionType || !newRule.dailyLimit || !newRule.monthlyLimit) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to add a new rule."
      });
      return;
    }

    const newLimit = {
      id: `lim${limitRules.length + 1}`,
      category: newRule.category,
      transactionType: newRule.transactionType,
      dailyLimit: parseFloat(newRule.dailyLimit),
      monthlyLimit: parseFloat(newRule.monthlyLimit),
    };
    
    setLimitRules(prev => [...prev, newLimit]);
    toast({
      title: "Rule Added",
      description: "New transaction limit rule has been added successfully.",
    });
    setDialogOpen(false);
    setNewRule({ category: "", transactionType: "", dailyLimit: "", monthlyLimit: "" });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Limits</CardTitle>
            <CardDescription>Manage daily and monthly transaction limits for different customer categories.</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
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
                    <TableCell>{formatCurrency(rule.monthlyLimit)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Limit Rule</DialogTitle>
            <DialogDescription>
              Define the limits for a customer category and transaction type. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select onValueChange={(value) => setNewRule(prev => ({...prev, category: value}))}>
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
               <Select onValueChange={(value) => setNewRule(prev => ({...prev, transactionType: value}))}>
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
                value={newRule.dailyLimit}
                onChange={(e) => setNewRule(prev => ({...prev, dailyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 100000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly-limit" className="text-right">Monthly Limit</Label>
              <Input
                id="monthly-limit"
                type="number"
                value={newRule.monthlyLimit}
                onChange={(e) => setNewRule(prev => ({...prev, monthlyLimit: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 1000000"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddRule}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
