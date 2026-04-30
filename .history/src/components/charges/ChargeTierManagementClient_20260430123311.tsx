'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [tierToDelete, setTierToDelete] = useState<ChargeTier | null>(null);

  const { toast } = useToast();
  const router = useRouter();

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
            <Button asChild>
              <Link href={`/charges/${chargeRuleId}/tiers/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Tier
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/charges/${chargeRuleId}/tiers/${tier.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
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
