
'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const authMethods = [
  { value: 'SMSOTP', label: 'SMS OTP' },
  { value: 'GAUTH', label: 'Google Authenticator' },
  { value: 'SQ', label: 'Security Question' },
  { value: 'EMAILOTP', label: 'Email OTP' },
];

const overviewFormSchema = z.object({
  mainAuthMethod: z.string().min(1, 'Main authentication method is required.'),
  twoFactorAuthMethod: z.string().min(1, '2FA method is required.'),
}).refine(data => data.mainAuthMethod !== data.twoFactorAuthMethod, {
  message: '2FA method must be different from the main authentication method.',
  path: ['twoFactorAuthMethod'],
});

type OverviewFormValues = z.infer<typeof overviewFormSchema>;

function OverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OverviewFormValues>({
    resolver: zodResolver(overviewFormSchema),
    defaultValues: {
      mainAuthMethod: '',
      twoFactorAuthMethod: '',
    },
  });

  const mainAuthWatcher = form.watch('mainAuthMethod');

  const customerString = searchParams.get('customer');
  const accountsString = searchParams.get('accounts');

  const { customer, accounts } = useMemo(() => {
    if (!customerString || !accountsString) {
      return { customer: null, accounts: [] };
    }
    try {
      return {
        customer: JSON.parse(customerString),
        accounts: JSON.parse(accountsString),
      };
    } catch (error) {
      console.error("Failed to parse search params:", error);
      return { customer: null, accounts: [] };
    }
  }, [customerString, accountsString]);

  if (!customer || accounts.length === 0) {
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


  const onSubmit = async (data: OverviewFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customer,
          accounts: accounts,
          manualData: { 
            signUpMainAuth: data.mainAuthMethod, 
            signUp2FA: data.twoFactorAuthMethod 
          },
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
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Onboard New Customer: Overview & Finalize</CardTitle>
        <CardDescription>
          Review all customer information and set security details before submitting for approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg mb-2">Customer Details</h3>
            <div className="text-sm space-y-1 p-4 border rounded-lg bg-muted/50">
                <p><span className="font-medium text-muted-foreground w-24 inline-block">Name:</span> {customer.full_name}</p>
                <p><span className="font-medium text-muted-foreground w-24 inline-block">CIF:</span> {customer.customer_number}</p>
                <p><span className="font-medium text-muted-foreground w-24 inline-block">Phone:</span> {customer.mobile_number}</p>
                <p><span className="font-medium text-muted-foreground w-24 inline-block">Email:</span> {customer.email_id}</p>
            </div>
        </div>
         <div>
            <h3 className="font-semibold text-lg mb-2">Accounts to be Linked ({accounts.length})</h3>
            <div className="text-sm space-y-1 p-4 border rounded-lg bg-muted/50">
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {accounts.map((acc: any) => (
                        <li key={acc.CUSTACNO}>{acc.CUSTACNO} ({acc.ACCLASSDESC})</li>
                ))}
                </ul>
            </div>
        </div>
        <Separator />
         <div>
            <h3 className="font-semibold text-lg mb-2">Security Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                <FormField
                    control={form.control}
                    name="mainAuthMethod"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Main Authentication Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a main auth method" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {authMethods.map(method => (
                                <SelectItem key={method.value} value={method.value}>
                                {method.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="twoFactorAuthMethod"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Two-Factor (2FA) Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a 2FA method" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                             {authMethods.map(method => (
                                <SelectItem 
                                    key={method.value} 
                                    value={method.value}
                                    disabled={method.value === mainAuthWatcher}
                                >
                                {method.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-6">
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
        <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Approval
        </Button>
    </CardFooter>
    </Card>
    </form>
    </Form>
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
