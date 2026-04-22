
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
import { Edit, PlusCircle, Trash2, Loader2, Search, Layers } from "lucide-react";
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

export interface ChargeTier {
    id: string;
    chargeRuleId: string;
    tierName: string | null;
    amountFrom: number;
    amountTo: number | null;
    percentage: number;
    fixedAmount: number;
    vatPercentage: number | null;
    minCharge: number | null;
    maxCharge: number | null;
    displayOrder: number;
}

export interface ChargeRule {
    id: string;
    customerCategoryId: string | null;
    transactionTypeId: string | null;
    category: string;
    transactionType: string;
    serviceName: string | null;
    chargeType: string;
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

  // Tier management state
  const [tierRule, setTierRule] = useState<ChargeRule | null>(null);
  const [isTierDialogOpen, setTierDialogOpen] = useState(false);
  const [tiers, setTiers] = useState<ChargeTier[]>([]);
  const [isLoadingTiers, setLoadingTiers] = useState(false);
  const [editingTier, setEditingTier] = useState<ChargeTier | null>(null);
  const [isTierFormOpen, setTierFormOpen] = useState(false);
  const [isTierSaving, setTierSaving] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<ChargeTier | null>(null);
  const [tierData, setTierData] = useState({
    tierName: "",
    amountFrom: "",
    amountTo: "",
    percentage: "",
    fixedAmount: "",
    vatPercentage: "",
    minCharge: "",
    maxCharge: "",
    displayOrder: "",
  });

  const [ruleData, setRuleData] = useState({
    categoryId: "",
    transactionTypeId: "",
    serviceName: "",
    chargeType: "FLAT",
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
    setRuleData({ categoryId: "", transactionTypeId: "", serviceName: "", chargeType: "FLAT", percentage: "", fixedAmount: "", vatPercentage: "15", minCharge: "", maxCharge: "", effectiveFrom: "", effectiveTo: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (rule: ChargeRule) => {
    setEditingRule(rule);
    setRuleData({
        categoryId: rule.customerCategoryId || "",
        transactionTypeId: rule.transactionTypeId || "",
        serviceName: rule.serviceName || "",
        chargeType: rule.chargeType || "FLAT",
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

  const openTierDialog = async (rule: ChargeRule) => {
    setTierRule(rule);
    setLoadingTiers(true);
    setTierDialogOpen(true);
    setTierFormOpen(false);
    try {
      const res = await fetch(`/api/charges/tiers?chargeRuleId=${rule.id}`);
      const data = await res.json();
      const loaded = Array.isArray(data) ? data : [];
      setTiers(loaded);
      // Auto-open the add form when there are no tiers yet
      if (loaded.length === 0) {
        setEditingTier(null);
        setTierData({ tierName: "", amountFrom: "0", amountTo: "", percentage: "", fixedAmount: "", vatPercentage: "", minCharge: "", maxCharge: "", displayOrder: "1" });
        setTierFormOpen(true);
      }
    } catch {
      setTiers([]);
      setEditingTier(null);
      setTierData({ tierName: "", amountFrom: "0", amountTo: "", percentage: "", fixedAmount: "", vatPercentage: "", minCharge: "", maxCharge: "", displayOrder: "1" });
      setTierFormOpen(true);
    } finally {
      setLoadingTiers(false);
    }
  };

  const openAddTierForm = () => {
    setEditingTier(null);
    setTierData({ tierName: "", amountFrom: "", amountTo: "", percentage: "", fixedAmount: "", vatPercentage: "", minCharge: "", maxCharge: "", displayOrder: String(tiers.length + 1) });
    setTierFormOpen(true);
  };

  const openEditTierForm = (tier: ChargeTier) => {
    setEditingTier(tier);
    setTierData({
      tierName: tier.tierName || "",
      amountFrom: String(tier.amountFrom),
      amountTo: tier.amountTo !== null ? String(tier.amountTo) : "",
      percentage: String(tier.percentage),
      fixedAmount: String(tier.fixedAmount),
      vatPercentage: tier.vatPercentage !== null ? String(tier.vatPercentage) : "",
      minCharge: tier.minCharge !== null ? String(tier.minCharge) : "",
      maxCharge: tier.maxCharge !== null ? String(tier.maxCharge) : "",
      displayOrder: String(tier.displayOrder),
    });
    setTierFormOpen(true);
  };

  const handleSaveTier = async (addAnother = false) => {
    if (tierData.amountFrom === "") {
      toast({ variant: "destructive", title: "Missing Fields", description: "Amount From is required." });
      return;
    }
    setTierSaving(true);
    const method = editingTier ? 'PUT' : 'POST';
    const payload = {
      id: editingTier?.id,
      chargeRuleId: tierRule?.id,
      ...tierData,
    };
    try {
      const res = await fetch('/api/charges/tiers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      const updatedTiers = editingTier
        ? tiers.map(t => t.id === editingTier.id ? result : t)
        : [...tiers, result];
      setTiers(updatedTiers);
      toast({ title: editingTier ? "Tier Updated" : "Tier Saved" });
      setEditingTier(null);
      if (addAnother && !editingTier) {
        // Pre-fill amountFrom with previous tier's amountTo + 0.01
        const prevAmountTo = result.amountTo;
        const nextFrom = prevAmountTo != null ? String(parseFloat(prevAmountTo) + 0.01) : "";
        setTierData({ tierName: "", amountFrom: nextFrom, amountTo: "", percentage: tierData.percentage, fixedAmount: "", vatPercentage: tierData.vatPercentage, minCharge: "", maxCharge: "", displayOrder: String(updatedTiers.length + 1) });
        setTierFormOpen(true);
      } else {
        setTierFormOpen(false);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setTierSaving(false);
    }
  };

  const handleDeleteTier = async () => {
    if (!tierToDelete) return;
    setTierSaving(true);
    try {
      const res = await fetch('/api/charges/tiers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tierToDelete.id }) });
      if (res.status !== 204) throw new Error('Failed to delete tier');
      setTiers(prev => prev.filter(t => t.id !== tierToDelete.id));
      toast({ title: "Tier Deleted" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setTierSaving(false);
      setTierToDelete(null);
    }
  };

  const handleSaveRule = async () => {
    if (ruleData.chargeType === 'FLAT' && !ruleData.percentage && !ruleData.fixedAmount) {
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
            setDialogOpen(false);
            setEditingRule(null);
        } else {
            setChargeRules(prev => [...prev, result]);
            setDialogOpen(false);
            setEditingRule(null);
            // Auto-open tier dialog for newly created TIERED rules
            if (ruleData.chargeType === 'TIERED') {
                toast({ title: "Rule Added", description: "Now configure the pricing tiers for this rule." });
                // Delay so the rule dialog fully closes before the tier dialog opens
                setTimeout(() => openTierDialog(result), 150);
                return;
            }
            toast({ title: "Rule Added", description: "New transaction charge rule has been added successfully." });
        }
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
                  <TableHead>Charge Type</TableHead>
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
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No charge rules found.</TableCell>
                  </TableRow>
                ) : filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="secondary">{rule.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell>{rule.serviceName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={rule.chargeType === 'TIERED' ? 'default' : 'outline'}>{rule.chargeType || 'FLAT'}</Badge>
                    </TableCell>
                    <TableCell>{rule.percentage ? `${rule.percentage}%` : '-'}</TableCell>
                    <TableCell>{rule.fixedAmount ? formatCurrency(rule.fixedAmount) : '-'}</TableCell>
                    <TableCell>{rule.vatPercentage}%</TableCell>
                    <TableCell>{formatCurrency(rule.minCharge)}</TableCell>
                    <TableCell>{formatCurrency(rule.maxCharge)}</TableCell>
                    <TableCell className="text-right">
                      {rule.chargeType === 'TIERED' && (
                        <Button variant="ghost" size="icon" title="Manage Tiers" onClick={() => openTierDialog(rule)}>
                          <Layers className="h-4 w-4" />
                        </Button>
                      )}
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
              <Label className="text-right">Charge Type</Label>
              <Select value={ruleData.chargeType} onValueChange={(value) => setRuleData(prev => ({...prev, chargeType: value}))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Charge Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">FLAT – Single rate</SelectItem>
                  <SelectItem value="TIERED">TIERED – Amount-based tiers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ruleData.chargeType === 'TIERED' ? (
              <>
                <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Tiered pricing enabled</p>
                  <p>Rates (%, fixed amount, min/max) are set per tier based on transaction amount ranges.</p>
                  {editingRule && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => { setDialogOpen(false); openTierDialog(editingRule); }}
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      Manage Tiers
                    </Button>
                  )}
                  {!editingRule && (
                    <p className="mt-2 text-xs italic">Save this rule — the tier editor will open automatically.</p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Default VAT %</Label>
                  <Input
                    type="number"
                    value={ruleData.vatPercentage}
                    onChange={(e) => setRuleData(prev => ({...prev, vatPercentage: e.target.value}))}
                    className="col-span-3"
                    placeholder="15"
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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

      {/* Tier Management Dialog */}
      <Dialog open={isTierDialogOpen} onOpenChange={(open) => { setTierDialogOpen(open); if (!open) setTierFormOpen(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Tiers – {tierRule?.serviceName || tierRule?.category}</DialogTitle>
            <DialogDescription>
              Define amount ranges and their fees. Each tier covers a range (e.g. 0–50 ETB) with its own percentage, fixed fee, and VAT.
            </DialogDescription>
          </DialogHeader>
          {isLoadingTiers ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <>
              {/* Tier form — shown first when adding */}
              {isTierFormOpen && (
                <div className="border rounded-md p-4 bg-muted/30 grid gap-3">
                  <p className="text-sm font-semibold">{editingTier ? 'Edit Tier' : '➕ New Tier'}</p>

                  {/* Amount range row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Amount From (ETB) *</Label>
                      <Input type="number" value={tierData.amountFrom} onChange={(e) => setTierData(p => ({...p, amountFrom: e.target.value}))} placeholder="e.g. 0" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Amount To (ETB) <span className="text-muted-foreground font-normal">— leave blank for unlimited</span></Label>
                      <Input type="number" value={tierData.amountTo} onChange={(e) => setTierData(p => ({...p, amountTo: e.target.value}))} placeholder="e.g. 50  (blank = ∞)" />
                    </div>
                  </div>

                  {/* Charges row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Percentage (%)</Label>
                      <Input type="number" value={tierData.percentage} onChange={(e) => setTierData(p => ({...p, percentage: e.target.value}))} placeholder="e.g. 2.5" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Fixed Amount (ETB)</Label>
                      <Input type="number" value={tierData.fixedAmount} onChange={(e) => setTierData(p => ({...p, fixedAmount: e.target.value}))} placeholder="e.g. 1.00" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">VAT % <span className="text-muted-foreground font-normal">(optional override)</span></Label>
                      <Input type="number" value={tierData.vatPercentage} onChange={(e) => setTierData(p => ({...p, vatPercentage: e.target.value}))} placeholder="Inherit from rule" />
                    </div>
                  </div>

                  {/* Min/Max + metadata row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Min Charge (ETB)</Label>
                      <Input type="number" value={tierData.minCharge} onChange={(e) => setTierData(p => ({...p, minCharge: e.target.value}))} placeholder="Optional" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Max Charge (ETB)</Label>
                      <Input type="number" value={tierData.maxCharge} onChange={(e) => setTierData(p => ({...p, maxCharge: e.target.value}))} placeholder="Optional" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Tier Name</Label>
                      <Input value={tierData.tierName} onChange={(e) => setTierData(p => ({...p, tierName: e.target.value}))} placeholder="e.g. Small Amount" />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <Button variant="outline" size="sm" onClick={() => setTierFormOpen(false)}>Cancel</Button>
                    {!editingTier && (
                      <Button variant="outline" size="sm" onClick={() => handleSaveTier(true)} disabled={isTierSaving}>
                        {isTierSaving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Save &amp; Add Another
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleSaveTier(false)} disabled={isTierSaving}>
                      {isTierSaving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                      {editingTier ? 'Update Tier' : 'Save Tier'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing tiers table */}
              {tiers.length > 0 && (
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>From (ETB)</TableHead>
                        <TableHead>To (ETB)</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Fixed</TableHead>
                        <TableHead>VAT %</TableHead>
                        <TableHead>Min / Max</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>{tier.displayOrder}</TableCell>
                          <TableCell>{tier.tierName || '-'}</TableCell>
                          <TableCell className="font-mono">{tier.amountFrom}</TableCell>
                          <TableCell className="font-mono">{tier.amountTo ?? '∞'}</TableCell>
                          <TableCell>{tier.percentage ? `${tier.percentage}%` : '-'}</TableCell>
                          <TableCell>{tier.fixedAmount ? formatCurrency(tier.fixedAmount) : '-'}</TableCell>
                          <TableCell>{tier.vatPercentage != null ? `${tier.vatPercentage}%` : <span className="text-muted-foreground text-xs">inherit</span>}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {tier.minCharge != null ? `Min: ${tier.minCharge}` : ''}
                            {tier.minCharge != null && tier.maxCharge != null ? ' / ' : ''}
                            {tier.maxCharge != null ? `Max: ${tier.maxCharge}` : ''}
                            {tier.minCharge == null && tier.maxCharge == null ? '-' : ''}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditTierForm(tier)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setTierToDelete(tier)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!isTierFormOpen && (
                <Button variant="outline" size="sm" onClick={openAddTierForm} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Tier
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!tierToDelete} onOpenChange={(open) => !open && setTierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tier "{tierToDelete?.tierName || `${tierToDelete?.amountFrom} – ${tierToDelete?.amountTo ?? '∞'}`}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTier} className="bg-red-600 hover:bg-red-700" disabled={isTierSaving}>
              {isTierSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
