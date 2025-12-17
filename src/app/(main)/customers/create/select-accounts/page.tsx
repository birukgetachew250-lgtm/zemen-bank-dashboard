
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
import { Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Account {
    CUSTACNO: string;
    BRANCH_CODE: string;
    CCY: string;
    ACCOUNT_TYPE: string;
    ACCLASSDESC: string;
    status: string; // Added status for UI consistency
}

// Mock function to fetch accounts for a CIF, simulating a gRPC call
const fetchAccountsByCif = async (cif: string): Promise<Account[]> => {
    console.log("Fetching accounts for CIF:", cif);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock data based on the provided proto schema
    return [
        { CUSTACNO: "1031110048533015", BRANCH_CODE: "103", CCY: "ETB", ACCOUNT_TYPE: "S", ACCLASSDESC: "Personal Saving - Private and Individual", status: "Active" },
        { CUSTACNO: "1031110048533016", BRANCH_CODE: "103", CCY: "ETB", ACCOUNT_TYPE: "C", ACCLASSDESC: "Personal Current - Private and Individual", status: "Active" },
        { CUSTACNO: "1031110048533017", BRANCH_CODE: "101", CCY: "USD", ACCOUNT_TYPE: "S", ACCLASSDESC: "Personal Domiciliary Saving", status: "Dormant" },
        { CUSTACNO: "1031110048533018", BRANCH_CODE: "103", CCY: "ETB", ACCOUNT_TYPE: "S", ACCLASSDESC: "Personal Saving - Joint", status: "Active" },
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

  useEffect(() => {
    if (customer.cif) {
      fetchAccountsByCif(customer.cif).then(data => {
        setAccounts(data);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [customer.cif]);

  const handleRemoveAccount = (accountNumber: string) => {
    setAccounts(prev => prev.filter(acc => acc.CUSTACNO !== accountNumber));
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

        router.push('/customers/create/success');
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
        <div className="w-full">
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
        </div>
    )
  }

  return (
    <div className="w-full">
    <Card>
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
                <TableHead>Account Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : accounts.length > 0 ? (
                accounts.map((acc) => (
                  <TableRow key={acc.CUSTACNO}>
                    <TableCell className="font-medium">{acc.CUSTACNO}</TableCell>
                    <TableCell>{acc.ACCLASSDESC}</TableCell>
                    <TableCell><Badge variant="outline">{acc.ACCOUNT_TYPE}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{acc.CCY}</Badge></TableCell>
                    <TableCell>{acc.BRANCH_CODE}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveAccount(acc.CUSTACNO)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No accounts found for this customer.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between mt-6 gap-2">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
            <Button onClick={handleSubmitForApproval} disabled={submitting || accounts.length === 0}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
            </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}


export default function SelectAccountsPage() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                <SelectAccountsContent />
            </Suspense>
        </div>
    )
}
