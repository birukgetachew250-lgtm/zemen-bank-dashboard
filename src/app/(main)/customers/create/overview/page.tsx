
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function OverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const customerString = searchParams.get('customer');
  const accountsString = searchParams.get('accounts');

  if (!customerString || !accountsString) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not retrieve customer or account data. Please start over.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="link" onClick={() => router.push('/customers/create')}>Start Over</Button>
            </CardContent>
        </Card>
    );
  }

  const customer = JSON.parse(customerString);
  const accounts = JSON.parse(accountsString);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customer,
          accounts: accounts,
          manualData: { signUpMainAuth: 'PIN', signUp2FA: 'SMSOTP' }, // Placeholder data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      router.push('/customers/create/success');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting the request for approval.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Onboard New Customer: Overview & Finalize</CardTitle>
        <CardDescription>
          Review customer information before submitting for approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg mb-2">Customer Details</h3>
            <div className="text-sm space-y-1">
                <p><span className="font-medium text-muted-foreground w-24 inline-block">Name:</span> {customer.full_name}</p>
                <p><span className="font-medium text-muted-foreground w-24 inline-block">CIF:</span> {customer.customer_number}</p>
                 <p><span className="font-medium text-muted-foreground w-24 inline-block">Phone:</span> {customer.mobile_number}</p>
                <p><span className="font-medium text-muted-foreground w-24 inline-block">Email:</span> {customer.email_id}</p>
            </div>
        </div>
         <div>
            <h3 className="font-semibold text-lg mb-2">Accounts to be Linked ({accounts.length})</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
               {accounts.map((acc: any) => (
                    <li key={acc.CUSTACNO}>{acc.CUSTACNO} ({acc.ACCLASSDESC})</li>
               ))}
            </ul>
        </div>
         <div>
            <h3 className="font-semibold text-lg mb-2">Security Details</h3>
             <div className="text-sm space-y-1">
                <p><span className="font-medium text-muted-foreground w-32 inline-block">Main Auth:</span> PIN</p>
                <p><span className="font-medium text-muted-foreground w-32 inline-block">2FA Method:</span> SMS OTP</p>
            </div>
        </div>
      </CardContent>
      <div className="flex justify-between items-center p-6">
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
        <Button onClick={onSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Approval
        </Button>
    </div>
    </Card>
  );
}

export default function OverviewPage() {
    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                <OverviewContent />
            </Suspense>
        </div>
    );
}
