
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
import { Loader2, PlusCircle, MinusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Account {
    custacno: string;
    branch_code: string;
    ccy: string;
    account_type: string;
    acclassdesc: string;
    status: string; 
    included: boolean;
}

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'secondary';
        case 'dormant': return 'outline';
        case 'inactive': return 'destructive';
        default: return 'default';
    }
}

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
            const response = await fetch('/api/onboarding/find-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cif: customer.customer_number,
                    branch_code: customer.branch_code || '103' // Fallback branch code
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch accounts.');
            }
            const data = await response.json();
            setAccounts(data.map((acc: any) => ({ ...acc, included: acc.status?.toLowerCase() === 'active' })));
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
  }, [customer.customer_number, customer.branch_code, toast]);

  const toggleAccountInclusion = (accountNumber: string) => {
    setAccounts(prev => prev.map(acc => 
        acc.custacno === accountNumber ? { ...acc, included: !acc.included } : acc
    ));
  };
  
  const handleNext = () => {
    const includedAccounts = accounts.filter(acc => acc.included);
    if (includedAccounts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Accounts Selected",
        description: "Please include at least one account to link.",
      });
      return;
    }
    
    // The API expects the original field names (CUSTACNO etc), so we map back
    const accountsToSubmit = includedAccounts.map(acc => ({
        CUSTACNO: acc.custacno,
        BRANCH_CODE: acc.branch_code,
        CCY: acc.ccy,
        ACCOUNT_TYPE: acc.account_type,
        ACCLASSDESC: acc.acclassdesc,
        status: acc.status,
    }))

    const params = new URLSearchParams({
        customer: JSON.stringify(customer),
        accounts: JSON.stringify(accountsToSubmit)
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
                     <Button variant="link" onClick={() => router.push('/customers/create')}>Go Back</Button>
                  </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
  }

  const includedCount = accounts.filter(acc => acc.included).length;

  return (
    <Card className="flex flex-col flex-grow">
      <CardHeader>
        <CardTitle className="font-headline text-2xl font-bold">Onboard New Customer</CardTitle>
        <CardDescription>
          Step 2: Review and select the accounts to link for mobile banking for <span className="font-semibold">{customer.full_name}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="rounded-md border flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : accounts.length > 0 ? (
                accounts.map((acc) => (
                  <TableRow key={acc.custacno} className={cn(!acc.included && "bg-muted/50 text-muted-foreground")}>
                    <TableCell className="font-medium">{acc.custacno}</TableCell>
                    <TableCell>{acc.acclassdesc}</TableCell>
                    <TableCell><Badge variant="outline">{acc.account_type}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{acc.ccy}</Badge></TableCell>
                    <TableCell>{acc.branch_code}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(acc.status)}
                        className={cn({
                            'bg-green-100 text-green-800 border-green-200': acc.status === 'Active',
                            'bg-yellow-100 text-yellow-800 border-yellow-200': acc.status === 'Dormant',
                            'bg-red-100 text-red-800 border-red-200': acc.status === 'Inactive',
                        })}
                      >
                          {acc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button 
                          variant={acc.included ? "destructive" : "secondary"} 
                          size="sm"
                          onClick={() => toggleAccountInclusion(acc.custacno)}
                          className={cn(acc.included ? "bg-red-500 hover:bg-red-600" : "")}
                        >
                        {acc.included ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {acc.included ? 'Exclude' : 'Include'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No accounts found for this customer.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center pt-6 gap-2">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
             <p className="text-sm text-muted-foreground">{includedCount} of {accounts.length} accounts selected.</p>
            <Button onClick={handleNext} disabled={includedCount === 0}>
                Next: Overview & Finalize
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function SelectAccountsPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <div className="w-full h-full flex flex-col">
              <SelectAccountsContent />
            </div>
        </Suspense>
    )
}
