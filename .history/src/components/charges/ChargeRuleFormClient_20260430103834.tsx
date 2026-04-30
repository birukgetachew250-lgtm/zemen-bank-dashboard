'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectSearch } from '@/components/ui/multi-select-search';
import { useToast } from '@/hooks/use-toast';

interface DropdownItem {
  id: string;
  name: string;
}

interface ChargeRuleFormClientProps {
  mode: 'create' | 'edit';
  customerCategories: DropdownItem[];
  transactionTypes: DropdownItem[];
  initialRule?: {
    id: string;
    customerCategoryId: string | null;
    customerCategoryIds?: string[];
    transactionTypeId: string | null;
    serviceName: string | null;
    chargeType: string;
    percentage: number;
    fixedAmount: number;
    vatPercentage: number;
    disasterRiskPercentage?: number;
    minCharge: number | null;
    maxCharge: number | null;
    effectiveFrom: string | null;
    effectiveTo: string | null;
  };
}

const toDateTimeLocal = (value: string | null | undefined) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
};

export function ChargeRuleFormClient({
  mode,
  customerCategories,
  transactionTypes,
  initialRule,
}: ChargeRuleFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [ruleData, setRuleData] = useState({
    categoryIds: initialRule?.customerCategoryIds || (initialRule?.customerCategoryId ? [initialRule.customerCategoryId] : []),
    transactionTypeId: initialRule?.transactionTypeId || '',
    serviceName: initialRule?.serviceName || '',
    chargeType: initialRule?.chargeType || 'FLAT',
    percentage: String(initialRule?.percentage || ''),
    fixedAmount: String(initialRule?.fixedAmount || ''),
    vatPercentage: String(initialRule?.vatPercentage ?? 15),
    disasterRiskPercentage: String(initialRule?.disasterRiskPercentage ?? ''),
    minCharge: initialRule?.minCharge !== null && initialRule?.minCharge !== undefined ? String(initialRule.minCharge) : '',
    maxCharge: initialRule?.maxCharge !== null && initialRule?.maxCharge !== undefined ? String(initialRule.maxCharge) : '',
    effectiveFrom: toDateTimeLocal(initialRule?.effectiveFrom),
    effectiveTo: toDateTimeLocal(initialRule?.effectiveTo),
  });

  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async () => {
    if (ruleData.chargeType === 'FLAT' && !ruleData.percentage && !ruleData.fixedAmount) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please provide at least percentage or fixed amount.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        id: initialRule?.id,
        ...ruleData,
      };
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch('/api/charges', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to save charge rule');
      }

      toast({ title: mode === 'edit' ? 'Charge rule updated' : 'Charge rule created' });
      router.push('/charges');
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{mode === 'edit' ? 'Edit Transaction Charge Rule' : 'Add Transaction Charge Rule'}</CardTitle>
          <CardDescription>Use this page to configure charge rule details.</CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link href="/charges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Customer Categories</Label>
            <MultiSelectSearch
              options={customerCategories.map((cat) => ({ id: cat.id, label: cat.name }))}
              selectedIds={ruleData.categoryIds}
              onChange={(ids) => setRuleData((prev) => ({ ...prev, categoryIds: ids }))}
              placeholder="All Categories (wildcard)"
              searchPlaceholder="Search categories..."
              emptyText="No categories found."
            />
            <p className="text-xs text-muted-foreground">Leave all unchecked to apply to all categories.</p>
          </div>

          <div className="grid gap-2">
            <Label>Transaction Type</Label>
            <Select value={ruleData.transactionTypeId} onValueChange={(value) => setRuleData((prev) => ({ ...prev, transactionTypeId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Types (optional)" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Service Name</Label>
          <Input
            placeholder="Service name (optional)"
            value={ruleData.serviceName}
            onChange={(e) => setRuleData((prev) => ({ ...prev, serviceName: e.target.value }))}
          />
        </div>

        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
          Disaster Risk Levy is mandatory for every charge calculation and is applied server-side.
        </div>

        <div className="grid gap-2">
          <Label>Charge Type</Label>
          <Select value={ruleData.chargeType} onValueChange={(value) => setRuleData((prev) => ({ ...prev, chargeType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select charge type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FLAT">FLAT - Single rate</SelectItem>
              <SelectItem value="TIERED">TIERED - Amount-based tiers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {ruleData.chargeType === 'TIERED' ? (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Tiered pricing enabled</p>
            <p>Configure tier ranges after saving this rule from the main charges list.</p>
            {mode === 'edit' && (
              <div className="mt-2 flex items-center gap-2">
                <p className="inline-flex items-center text-xs">
                  <Layers className="mr-1 h-3 w-3" />
                  Open dedicated tiers page.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/charges/${initialRule?.id}/tiers`}>Manage Tiers</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Percentage</Label>
              <Input
                type="number"
                placeholder="e.g. 0.5"
                value={ruleData.percentage}
                onChange={(e) => setRuleData((prev) => ({ ...prev, percentage: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fixed Amount</Label>
              <Input
                type="number"
                placeholder="e.g. 10"
                value={ruleData.fixedAmount}
                onChange={(e) => setRuleData((prev) => ({ ...prev, fixedAmount: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>VAT %</Label>
            <Input
              type="number"
              value={ruleData.vatPercentage}
              onChange={(e) => setRuleData((prev) => ({ ...prev, vatPercentage: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Disaster Risk %</Label>
            <Input
              type="number"
              placeholder="e.g. 1.5"
              value={ruleData.disasterRiskPercentage}
              onChange={(e) => setRuleData((prev) => ({ ...prev, disasterRiskPercentage: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Min Charge</Label>
            <Input
              type="number"
              value={ruleData.minCharge}
              onChange={(e) => setRuleData((prev) => ({ ...prev, minCharge: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Max Charge</Label>
            <Input
              type="number"
              value={ruleData.maxCharge}
              onChange={(e) => setRuleData((prev) => ({ ...prev, maxCharge: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Effective From</Label>
            <Input
              type="datetime-local"
              value={ruleData.effectiveFrom}
              onChange={(e) => setRuleData((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Effective To</Label>
            <Input
              type="datetime-local"
              value={ruleData.effectiveTo}
              onChange={(e) => setRuleData((prev) => ({ ...prev, effectiveTo: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/charges">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'edit' ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
