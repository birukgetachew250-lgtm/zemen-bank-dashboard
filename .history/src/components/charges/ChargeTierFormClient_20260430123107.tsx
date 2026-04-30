'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ChargeTierFormData {
  tierName: string;
  amountFrom: string;
  amountTo: string;
  percentage: string;
  fixedAmount: string;
  vatPercentage: string;
  minCharge: string;
  maxCharge: string;
  displayOrder: string;
}

interface ChargeTierInitialData {
  id: string;
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

interface ChargeTierFormClientProps {
  mode: 'create' | 'edit';
  chargeRuleId: string;
  chargeRuleLabel: string;
  initialData?: ChargeTierInitialData;
  defaultDisplayOrder?: number;
}

export function ChargeTierFormClient({
  mode,
  chargeRuleId,
  chargeRuleLabel,
  initialData,
  defaultDisplayOrder = 1,
}: ChargeTierFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [tierData, setTierData] = useState<ChargeTierFormData>(() => {
    if (initialData) {
      return {
        tierName: initialData.tierName || '',
        amountFrom: String(initialData.amountFrom),
        amountTo: initialData.amountTo !== null ? String(initialData.amountTo) : '',
        percentage: String(initialData.percentage),
        fixedAmount: String(initialData.fixedAmount),
        vatPercentage: initialData.vatPercentage !== null ? String(initialData.vatPercentage) : '',
        minCharge: initialData.minCharge !== null ? String(initialData.minCharge) : '',
        maxCharge: initialData.maxCharge !== null ? String(initialData.maxCharge) : '',
        displayOrder: String(initialData.displayOrder),
      };
    }

    return {
      tierName: '',
      amountFrom: '',
      amountTo: '',
      percentage: '',
      fixedAmount: '',
      vatPercentage: '',
      minCharge: '',
      maxCharge: '',
      displayOrder: String(defaultDisplayOrder),
    };
  });

  const handleSave = async () => {
    if (!tierData.amountFrom) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Amount From is required.' });
      return;
    }

    setIsSaving(true);

    const payload = {
      id: initialData?.id,
      chargeRuleId,
      ...tierData,
    };

    try {
      const response = await fetch('/api/charges/tiers', {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save tier');

      toast({ title: mode === 'edit' ? 'Tier updated' : 'Tier created' });
      router.push(`/charges/${chargeRuleId}/tiers`);
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || 'Unable to save tier.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>{mode === 'edit' ? 'Edit Charge Tier' : 'Add Charge Tier'}</CardTitle>
            <CardDescription>{chargeRuleLabel}</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/charges/${chargeRuleId}/tiers`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back To Tiers
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Display Order</Label>
            <Input type="number" value={tierData.displayOrder} onChange={(e) => setTierData((p) => ({ ...p, displayOrder: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href={`/charges/${chargeRuleId}/tiers`}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'edit' ? 'Update Tier' : 'Create Tier'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
