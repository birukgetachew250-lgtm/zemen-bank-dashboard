
'use client';

import { useState, useMemo, Suspense } from 'react';
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
import { Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Account {
    accountNumber: string;
    accountType: string;
    currency: string;
    branchName: string;
    status: string;
}

// Mock function to fetch accounts for a CIF
const fetchAccountsByCif = async (cif: string): Promise<Account[]> => {
    console.log("Fetching accounts for CIF:", cif);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { accountNumber: "0012345678", accountType: "Savings", currency: "NGN", status: "Active", branchName: "Head Office" },
        { accountNumber: "0087654321", accountType: "Current", currency: "NGN", status: "Active", branchName: "Head Office" },
        { accountNumber: "3012345678", accountType: "Domiciliary", currency: "USD", status: "Dormant", branchName: "VI Branch" },
        { accountNumber: "4009876543", accountType: "Fixed Deposit", currency: "NGN", status: "Active", branchName: "Head Office" },
    ];
};

function SelectAccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const customer = useMemo(() => ({
    cif: searchParams.get('cif'),
    name: searchParams.get('name'),
    phoneNumber: searchParams.get('phoneNumber'),
    email: searchParams.get('email'),
  }), [searchParams]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    if (customer.cif) {
      fetchAccountsByCif(customer.cif).then(data => {
        setAccounts(data);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  });

  const handleRemoveAccount = (accountNumber: string) => {
    setAccounts(prev => prev.filter(acc => acc.accountNumber !== accountNumber));
  };
  
  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    try {
        const response = await fetch('/api/customers/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer, accounts }),
        });

        if (!response.ok) throw new Error('Submission failed');

        toast({
            title: "Successfully Submitted",
            description: `${customer.name} has been submitted for mobile banking approval.`,
        });

        router.push('/customers/approve-new');
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "An error occurred while submitting the request for approval.",
      });
    } finally {
        setSubmitting(false);
    }
  };


  if (!customer.cif) {
    return (
        <Card className="w-full max-w-4xl">
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

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl font-bold">Onboard New Customer</CardTitle>
        <CardDescription>
          Step 2: Review and select the accounts to link for mobile banking for <span className="font-semibold">{customer.name}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin" /></TableCell></TableRow>
              ) : accounts.length > 0 ? (
                accounts.map((acc) => (
                  <TableRow key={acc.accountNumber}>
                    <TableCell className="font-medium">{acc.accountNumber}</TableCell>
                    <TableCell>{acc.accountType}</TableCell>
                    <TableCell><Badge variant="outline">{acc.currency}</Badge></TableCell>
                    <TableCell>
                        <Badge className={acc.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                            {acc.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveAccount(acc.accountNumber)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No accounts found for this customer.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
            <Button onClick={handleSubmitForApproval} disabled={submitting || accounts.length === 0}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function SelectAccountsPage() {
    return (
        <div className="w-full flex justify-center">
            <Suspense fallback={<div>Loading...</div>}>
                <SelectAccountsContent />
            </Suspense>
        </div>
    )
}

