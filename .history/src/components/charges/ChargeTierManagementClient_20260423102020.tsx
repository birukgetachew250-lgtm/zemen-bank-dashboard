'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ChargeTier {
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

interface ChargeTierManagementClientProps {
  chargeRuleId: string;
  chargeRuleLabel: string;
  initialTiers: ChargeTier[];
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-';
  return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function ChargeTierManagementClient({
  chargeRuleId,
  chargeRuleLabel,
  initialTiers,
}: ChargeTierManagementClientProps) {
  const [tiers, setTiers] = useState<ChargeTier[]>(initialTiers);
  const [isSaving, setIsSaving] = useState(false);
  const [isTierFormOpen, setTierFormOpen] = useState(initialTiers.length === 0);
  const [editingTier, setEditingTier] = useState<ChargeTier | null>(null);
  const [tierToDelete, setTierToDelete] = useState<ChargeTier | null>(null);
  const [tierData, setTierData] = useState({
    tierName: '',
    amountFrom: '',
    amountTo: '',
    percentage: '',
    fixedAmount: '',
    vatPercentage: '',
    minCharge: '',
    maxCharge: '',
    displayOrder: '',
  });

  const { toast } = useToast();
  const router = useRouter();

  const openAddTierForm = () => {
    setEditingTier(null);
    setTierFormOpen(true);
    setTierData({
      tierName: '',
      amountFrom: '',
      amountTo: '',
      percentage: '',
      fixedAmount: '',
      vatPercentage: '',
      minCharge: '',
      maxCharge: '',
      displayOrder: String(tiers.length + 1),
    });
  };

  const openEditTierForm = (tier: ChargeTier) => {
    setEditingTier(tier);
    setTierFormOpen(true);
    setTierData({
      tierName: tier.tierName || '',
      amountFrom: String(tier.amountFrom),
      amountTo: tier.amountTo !== null ? String(tier.amountTo) : '',
      percentage: String(tier.percentage),
      fixedAmount: String(tier.fixedAmount),
      vatPercentage: tier.vatPercentage !== null ? String(tier.vatPercentage) : '',
      minCharge: tier.minCharge !== null ? String(tier.minCharge) : '',
      maxCharge: tier.maxCharge !== null ? String(tier.maxCharge) : '',
      displayOrder: String(tier.displayOrder),
    });
  };

  const handleSaveTier = async (addAnother = false) => {
    if (!tierData.amountFrom) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Amount From is required.' });
      return;
    }

    setIsSaving(true);
    const method = editingTier ? 'PUT' : 'POST';
    const payload = {
      id: editingTier?.id,
      chargeRuleId,
      ...tierData,
    };

    try {
      const res = await fetch('/api/charges/tiers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save tier');

      const updated = editingTier
        ? tiers.map((tier) => (tier.id === editingTier.id ? result : tier))
        : [...tiers, result];
      setTiers(updated);
      toast({ title: editingTier ? 'Tier updated' : 'Tier saved' });
      setEditingTier(null);

      if (addAnother && !editingTier) {
        const prevAmountTo = result.amountTo;
        const nextFrom = prevAmountTo != null ? String(parseFloat(prevAmountTo) + 0.01) : '';
        setTierFormOpen(true);
        setTierData({
          tierName: '',
          amountFrom: nextFrom,
          amountTo: '',
          percentage: tierData.percentage,
          fixedAmount: '',
          vatPercentage: tierData.vatPercentage,
          minCharge: '',
          maxCharge: '',
          displayOrder: String(updated.length + 1),
        });
      } else {
        setTierData({
          tierName: '',
          amountFrom: '',
          amountTo: '',
          percentage: '',
          fixedAmount: '',
          vatPercentage: '',
          minCharge: '',
          maxCharge: '',
          displayOrder: String(updated.length + 1),
        });
        setTierFormOpen(false);
      }

      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Unable to save tier.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTier = async () => {
    if (!tierToDelete) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/charges/tiers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tierToDelete.id }),
      });
      if (res.status !== 204) {
        throw new Error('Failed to delete tier');
      }

      setTiers((prev) => prev.filter((tier) => tier.id !== tierToDelete.id));
      toast({ title: 'Tier deleted' });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Unable to delete tier.' });
    } finally {
      setIsSaving(false);
      setTierToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Tiers</CardTitle>
            <CardDescription>{chargeRuleLabel}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/charges">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back To Charges
              </Link>
            </Button>
            <Button onClick={openAddTierForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Tier
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isTierFormOpen && (
            <div className="grid gap-4 rounded-md border bg-muted/30 p-4">
              <p className="text-sm font-semibold">{editingTier ? 'Edit Tier' : 'Add New Tier'}</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Amount From (ETB) *</Label>
                  <Input type="number" value={tierData.amountFrom} onChange={(e) => setTierData((p) => ({ ...p, amountFrom: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Amount To (ETB)</Label>
                  <Input type="number" placeholder="Leave blank for unlimited" value={tierData.amountTo} onChange={(e) => setTierData((p) => ({ ...p, amountTo: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Percentage (%)</Label>
                  <Input type="number" value={tierData.percentage} onChange={(e) => setTierData((p) => ({ ...p, percentage: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Fixed Amount (ETB)</Label>
                  <Input type="number" value={tierData.fixedAmount} onChange={(e) => setTierData((p) => ({ ...p, fixedAmount: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>VAT %</Label>
                  <Input type="number" placeholder="Optional override" value={tierData.vatPercentage} onChange={(e) => setTierData((p) => ({ ...p, vatPercentage: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Min Charge (ETB)</Label>
                  <Input type="number" value={tierData.minCharge} onChange={(e) => setTierData((p) => ({ ...p, minCharge: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Max Charge (ETB)</Label>
                  <Input type="number" value={tierData.maxCharge} onChange={(e) => setTierData((p) => ({ ...p, maxCharge: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Tier Name</Label>
                  <Input value={tierData.tierName} onChange={(e) => setTierData((p) => ({ ...p, tierName: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTier(null);
                    setTierFormOpen(false);
                    setTierData({ tierName: '', amountFrom: '', amountTo: '', percentage: '', fixedAmount: '', vatPercentage: '', minCharge: '', maxCharge: '', displayOrder: String(tiers.length + 1) });
                  }}
                >
                  Cancel
                </Button>
                {!editingTier && (
                  <Button variant="outline" onClick={() => handleSaveTier(true)} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Add Another
                  </Button>
                )}
                <Button onClick={() => handleSaveTier(false)} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTier ? 'Update Tier' : 'Save Tier'}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border">
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
                {tiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                      No tiers found. Add the first tier.
                    </TableCell>
                  </TableRow>
                ) : (
                  tiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell>{tier.displayOrder}</TableCell>
                      <TableCell>{tier.tierName || '-'}</TableCell>
                      <TableCell className="font-mono">{tier.amountFrom}</TableCell>
                      <TableCell className="font-mono">{tier.amountTo ?? '∞'}</TableCell>
                      <TableCell>{tier.percentage ? `${tier.percentage}%` : '-'}</TableCell>
                      <TableCell>{tier.fixedAmount ? formatCurrency(tier.fixedAmount) : '-'}</TableCell>
                      <TableCell>{tier.vatPercentage != null ? `${tier.vatPercentage}%` : 'inherit'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tier.minCharge != null ? `Min: ${tier.minCharge}` : ''}
                        {tier.minCharge != null && tier.maxCharge != null ? ' / ' : ''}
                        {tier.maxCharge != null ? `Max: ${tier.maxCharge}` : ''}
                        {tier.minCharge == null && tier.maxCharge == null ? '-' : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditTierForm(tier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setTierToDelete(tier)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
            <AlertDialogAction onClick={handleDeleteTier} className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
