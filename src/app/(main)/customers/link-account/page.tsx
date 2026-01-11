
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { CustomerDetailsCard, type CustomerDetails } from '@/components/customers/CustomerDetailsCard';

const linkAccountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  accountType: z.string().min(1, 'Account type is required'),
  currency: z.string().min(3, 'Currency is required').max(3),
});

type LinkAccountFormValues = z.infer<typeof linkAccountSchema>;

export default function LinkAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cifNumber, setCifNumber] = useState('');
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LinkAccountFormValues>({
    resolver: zodResolver(linkAccountSchema),
    defaultValues: {
      accountNumber: '',
      accountType: '',
      currency: 'ETB',
    },
  });

  const handleSearch = async () => {
    if (!cifNumber) {
      toast({
        variant: 'destructive',
        title: 'CIF number required',
        description: 'Please enter a CIF number to search.',
      });
      return;
    }
    setIsLoading(true);
    setCustomer(null);
    try {
      const response = await fetch(`/api/customers/${cifNumber}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Customer not found');
      }
      const data = await response.json();
      setCustomer(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (values: LinkAccountFormValues) => {
    if (!customer) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            cif: customer.cifNumber, 
            type: 'customer-account', 
            customerName: customer.name, 
            customerPhone: customer.phoneNumber,
            details: {
                ...values,
                customerName: customer.name,
                cif: customer.cifNumber
            }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
      toast({
        title: 'Request Submitted',
        description: 'Account link request has been sent for approval.'
      });
      setCustomer(null);
      setCifNumber('');
      form.reset();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Link New Account</CardTitle>
          <CardDescription>Search for a customer by CIF, then provide the new account details to link.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter CIF Number..."
              value={cifNumber}
              onChange={(e) => setCifNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {customer && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>New Account for {customer.name}</CardTitle>
            <CardDescription>Enter the details for the new account to be linked to this customer.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="accountNumber" render={({ field }) => (
                  <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Enter the full account number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="accountType" render={({ field }) => (
                        <FormItem><FormLabel>Account Type/Class</FormLabel><FormControl><Input placeholder="e.g., Personal Saving" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="e.g., ETB" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit for Approval
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}
