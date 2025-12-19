
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
    chargeType: 'Percentage';
    value: number;
}

const initialChargeRules: ChargeRule[] = [
  { id: 'chg1', category: 'Retail', transactionType: 'Fund Transfer', chargeType: 'Percentage', value: 0.25 },
  { id: 'chg2', category: 'Retail', transactionType: 'Bill Payment', chargeType: 'Percentage', value: 0.15 },
  { id: 'chg3', category: 'Premium', transactionType: 'Fund Transfer', chargeType: 'Percentage', value: 0.1 },
  { id: 'chg4', category: 'Corporate', transactionType: 'Bulk Payment', chargeType: 'Percentage', value: 0.05 },
];

const customerCategories = ["Retail", "Premium", "Corporate"];
const transactionTypes = ["Fund Transfer", "Bill Payment", "Airtime/Data", "Bulk Payment"];

export default function TransactionChargesPage() {
  const [chargeRules, setChargeRules] = useState(initialChargeRules);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ChargeRule | null>(null);

  const [ruleData, setRuleData] = useState<{
    category: string;
    transactionType: string;
    value: string;
  }>({
    category: "",
    transactionType: "",
    value: ""
  });
  const { toast } = useToast();

  const formatValue = (rule: ChargeRule) => {
    return `${rule.value}%`;
  }

  const openAddDialog = () => {
    setEditingRule(null);
    setRuleData({ category: "", transactionType: "", value: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (rule: ChargeRule) => {
    setEditingRule(rule);
    setRuleData({
        category: rule.category,
        transactionType: rule.transactionType,
        value: String(rule.value)
    });
    setDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (!ruleData.category || !ruleData.transactionType || !ruleData.value) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to save the charge rule."
      });
      return;
    }

    if (editingRule) {
        // Update existing rule
        setChargeRules(prev => prev.map(r => r.id === editingRule.id ? { ...editingRule, ...ruleData, chargeType: 'Percentage', value: parseFloat(ruleData.value) } : r));
        toast({
            title: "Rule Updated",
            description: "The transaction charge rule has been updated successfully.",
        });
    } else {
        // Add new rule
        const newCharge: ChargeRule = {
          id: `chg${Date.now()}`,
          category: ruleData.category,
          transactionType: ruleData.transactionType,
          chargeType: 'Percentage',
          value: parseFloat(ruleData.value),
        };
        setChargeRules(prev => [...prev, newCharge]);
        toast({
          title: "Rule Added",
          description: "New transaction charge rule has been added successfully.",
        });
    }
    
    setDialogOpen(false);
    setEditingRule(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Charges</CardTitle>
            <CardDescription>Manage percentage-based charges for different transactions.</CardDescription>
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
            <DialogTitle>{editingRule ? 'Edit' : 'Add'} Charge Rule</DialogTitle>
            <DialogDescription>
              Define the charge for a specific transaction and customer type.
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
                <Label className="text-right col-span-1">Charge Type</Label>
                <div className="col-span-3">
                    <Badge variant="outline">Percentage</Badge>
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value (%)
              </Label>
              <Input
                id="value"
                type="number"
                value={ruleData.value}
                onChange={(e) => setRuleData(prev => ({...prev, value: e.target.value}))}
                className="col-span-3"
                placeholder="e.g. 0.5"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveRule}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
