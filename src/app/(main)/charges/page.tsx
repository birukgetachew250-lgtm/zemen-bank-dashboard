
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

interface ChargeRule {
    id: string;
    category: string;
    transactionType: string;
    chargeType: 'Percentage' | 'Fixed';
    value: number;
}

const initialChargeRules: ChargeRule[] = [
  { id: 'chg1', category: 'Retail', transactionType: 'Fund Transfer', chargeType: 'Fixed', value: 25.00 },
  { id: 'chg2', category: 'Retail', transactionType: 'Bill Payment', chargeType: 'Fixed', value: 50.00 },
  { id: 'chg3', category: 'Premium', transactionType: 'Fund Transfer', chargeType: 'Percentage', value: 0.1 },
  { id: 'chg4', category: 'Corporate', transactionType: 'Bulk Payment', chargeType: 'Fixed', value: 1000.00 },
];

const customerCategories = ["Retail", "Premium", "Corporate"];
const transactionTypes = ["Fund Transfer", "Bill Payment", "Airtime/Data", "Bulk Payment"];
const chargeTypes = ["Fixed", "Percentage"];


export default function TransactionChargesPage() {
  const [chargeRules, setChargeRules] = useState(initialChargeRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState<{
    category: string;
    transactionType: string;
    chargeType: 'Fixed' | 'Percentage' | '';
    value: string;
  }>({
    category: "",
    transactionType: "",
    chargeType: "",
    value: ""
  });
  const { toast } = useToast();

  const formatValue = (rule: ChargeRule) => {
    if (rule.chargeType === 'Percentage') {
        return `${rule.value}%`;
    }
    return `ETB ${rule.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const handleAddRule = () => {
    if (!newRule.category || !newRule.transactionType || !newRule.chargeType || !newRule.value) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to add a new charge rule."
      });
      return;
    }

    const newCharge: ChargeRule = {
      id: `chg${chargeRules.length + 1}`,
      category: newRule.category,
      transactionType: newRule.transactionType,
      chargeType: newRule.chargeType as 'Fixed' | 'Percentage',
      value: parseFloat(newRule.value),
    };
    
    setChargeRules(prev => [...prev, newCharge]);
    toast({
      title: "Rule Added",
      description: "New transaction charge rule has been added successfully.",
    });
    setDialogOpen(false);
    setNewRule({ category: "", transactionType: "", chargeType: "", value: "" });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Charges</CardTitle>
            <CardDescription>Manage fixed and percentage-based charges for different transactions.</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
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
                       <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
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
            <DialogTitle>Add New Charge Rule</DialogTitle>
            <DialogDescription>
              Define the charge for a specific transaction and customer type.
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
              <Label htmlFor="charge-type" className="text-right">Charge Type</Label>
               <Select onValueChange={(value: 'Fixed' | 'Percentage') => setNewRule(prev => ({...prev, chargeType: value}))}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                    {chargeTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                type="number"
                value={newRule.value}
                onChange={(e) => setNewRule(prev => ({...prev, value: e.target.value}))}
                className="col-span-3"
                placeholder={newRule.chargeType === 'Percentage' ? "e.g. 0.5" : "e.g. 50.00"}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddRule}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
