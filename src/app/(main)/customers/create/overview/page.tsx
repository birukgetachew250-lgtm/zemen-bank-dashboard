
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const overviewFormSchema = z.object({
  signUpMainAuth: z.string().min(1, 'Primary authentication is required'),
  signUp2FA: z.string().min(1, 'Two-factor authentication is required'),
});

function OverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const customer = JSON.parse(searchParams.get('customer') || '{}');
  const accounts = JSON.parse(searchParams.get('accounts') || '[]');

  const form = useForm<z.infer<typeof overviewFormSchema>>({
    resolver: zodResolver(overviewFormSchema),
    defaultValues: {
      signUpMainAuth: 'PIN',
      signUp2FA: 'SMSOTP',
    },
  });

  const onSubmit = async (data: z.infer<typeof overviewFormSchema>) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customer,
          accounts: accounts,
          manualData: data,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      router.push('/customers/create/success');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'An error occurred while submitting the request for approval.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!customer.customer_number) {
    return <div>Error: No customer data. <Button variant="link" onClick={() => router.push('/customers/create')}>Start Over</Button></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboard New Customer: Overview & Finalize</CardTitle>
        <CardDescription>
          Step 3: Review all customer information and set authentication methods before submitting for approval.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Separator />
            <h3 className="text-lg font-semibold">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <InfoItem label="Full Name" value={customer.full_name} />
                <InfoItem label="CIF Number" value={customer.customer_number} />
                <InfoItem label="Mobile Number" value={customer.mobile_number} />
                <InfoItem label="Email" value={customer.email_id} />
                <InfoItem label="Gender" value={customer.gender} />
                <InfoItem label="Date of Birth" value={new Date(customer.date_of_birth).toLocaleDateString()} />
            </div>
            
            <Separator />
            <h3 className="text-lg font-semibold">Linked Accounts ({accounts.length})</h3>
            <div className="rounded-md border text-sm">
                <div className="flex flex-col">
                    {accounts.map((acc: any) => (
                        <div key={acc.CUSTACNO} className="flex justify-between p-3 border-b last:border-b-0">
                            <div className="font-medium">{acc.CUSTACNO} <Badge variant="outline">{acc.CCY}</Badge></div>
                            <div className="text-muted-foreground">{acc.ACCLASSDESC}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />
            <h3 className="text-lg font-semibold">Set Authentication Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="signUpMainAuth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Authentication</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIN">PIN</SelectItem>
                        <SelectItem value="PASSWORD">Password</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="signUp2FA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two-Factor Authentication (2FA)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a method" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SMSOTP">SMS OTP</SelectItem>
                        <SelectItem value="GAUTH">Google Authenticator</SelectItem>
                        <SelectItem value="SQ">Security Questions</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <div className="flex justify-between items-center p-6">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
            <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
            </Button>
        </div>
        </form>
      </Form>
    </Card>
  );
}

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("space-y-1", className)}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="font-semibold">{value}</div>
        </div>
    )
}

export default function OverviewPage() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                <OverviewContent />
            </Suspense>
        </div>
    )
}