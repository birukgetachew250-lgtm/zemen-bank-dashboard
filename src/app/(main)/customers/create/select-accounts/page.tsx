'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, MinusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OnboardingWizardLayout } from '@/components/customers/OnboardingWizardLayout';
import { cn } from '@/lib/utils';

interface Account {
  custacno: string;
  branch_code: string;
  ccy: string;
  account_type: string;
  account_class: string;
  acclassdesc: string;
  status: string;
  acc_status: string;
  record_stat: string;
  ac_stat_frozen: string;
  included: boolean;
  isBlocked: boolean;
  blockReason: string | null;
}

const getStatusVariant = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'secondary';
    case 'dormant':
      return 'outline';
    case 'inactive':
      return 'destructive';
    default:
      return 'default';
  }
};

function SelectAccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const customer = useMemo(() => {
    const data = searchParams.get('customer');
    return data ? JSON.parse(data) : {};
  }, [searchParams]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      if (!customer.customer_number) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/online-linking/find-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cif: customer.customer_number,
            branch_code: customer.branch || customer.branch_code || '103',
          }),
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          data = await response.json();
        } else {
          const rawText = await response.text();
          throw new Error(
            `Server returned non-JSON response (${response.status}): ${rawText.slice(0, 100)}`
          );
        }

        if (!response.ok) {
          throw new Error(data?.message || `Failed to fetch accounts (${response.status})`);
        }
        setAccounts(
          data.map((acc: any) => ({
            ...acc,
            included: !acc.isBlocked && acc.status?.toLowerCase() === 'active',
          }))
        );
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Could not fetch accounts',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, [customer.customer_number, customer.branch, customer.branch_code, toast]);

  const toggleAccountInclusion = (accountNumber: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.custacno === accountNumber && !acc.isBlocked
          ? { ...acc, included: !acc.included }
          : acc
      )
    );
  };

  const handleNext = () => {
    const includedAccounts = accounts.filter((acc) => acc.included);
    if (includedAccounts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Accounts Selected',
        description: 'Please include at least one account to link.',
      });
      return;
    }

    const accountsToSubmit = includedAccounts.map((acc) => ({
      CUSTACNO: acc.custacno,
      BRANCH_CODE: acc.branch_code,
      CCY: acc.ccy,
      ACCOUNT_TYPE: acc.account_type,
      ACCLASSDESC: acc.acclassdesc,
      status: acc.status,
    }));

    const params = new URLSearchParams({
      customer: JSON.stringify(customer),
      accounts: JSON.stringify(accountsToSubmit),
    });
    router.push(`/customers/create/overview?${params.toString()}`);
  };

  if (!customer.customer_number) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Missing Customer Information</AlertTitle>
            <AlertDescription>
              No customer CIF was provided. Please go back to the previous step and fetch customer details first.
              <Button variant="link" onClick={() => router.push('/customers/create')}>
                Go Back
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const includedCount = accounts.filter((acc) => acc.included).length;

  return (
    <OnboardingWizardLayout
      currentStep={3}
      maxReachableStep={3}
      onStepClick={(s) => {
        if (s <= 2) router.back();
      }}
      title="Register Customer (Maker)"
      description={`Step 3: Select eligible accounts to link for ${customer.full_name} (CIF ${customer.customer_number}).`}
    >
      <Card className="glass-card flex flex-grow flex-col">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Step 3: Accounts &amp; Channels
          </CardTitle>
          <CardDescription>
            Review and select the FlexCube accounts to link for mobile banking for{' '}
            <span className="font-semibold text-foreground">{customer.full_name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col">
          <div className="flex-grow overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>CCY</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="mx-auto animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <TableRow
                      key={acc.custacno}
                      className={cn(
                        !acc.included && 'bg-muted/40 text-muted-foreground',
                        acc.isBlocked && 'bg-destructive/5 opacity-70'
                      )}
                    >
                      <TableCell className="font-mono font-semibold">
                        {acc.custacno}
                      </TableCell>
                      <TableCell>{acc.acclassdesc}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.account_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.account_class}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.ccy}</Badge>
                      </TableCell>
                      <TableCell>{acc.branch_code}</TableCell>
                      <TableCell>
                        {acc.isBlocked ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="destructive" className="w-fit">
                              Blocked
                            </Badge>
                            {acc.blockReason && (
                              <span className="text-xs text-destructive">
                                {acc.blockReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant={getStatusVariant(acc.status)}
                            className={cn({
                              'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':
                                acc.status === 'Active',
                              'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300':
                                acc.status === 'Dormant',
                              'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300':
                                acc.status === 'Inactive',
                            })}
                          >
                            {acc.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={acc.included ? 'destructive' : 'secondary'}
                          size="sm"
                          onClick={() => toggleAccountInclusion(acc.custacno)}
                          disabled={acc.isBlocked}
                        >
                          {acc.included ? (
                            <MinusCircle className="mr-1.5 h-4 w-4" />
                          ) : (
                            <PlusCircle className="mr-1.5 h-4 w-4" />
                          )}
                          {acc.isBlocked ? 'Blocked' : acc.included ? 'Exclude' : 'Include'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No accounts found for this customer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-2 pt-6">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{includedCount}</span> of{' '}
              {accounts.length} accounts selected
            </p>
            <Button onClick={handleNext} disabled={includedCount === 0} className="gap-2">
              Next: Review &amp; Submit
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </OnboardingWizardLayout>
  );
}

export default function SelectAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <div className="flex h-full w-full flex-col">
        <SelectAccountsContent />
      </div>
    </Suspense>
  );
}
