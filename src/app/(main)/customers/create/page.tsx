'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MakerMiniHistory } from "@/components/customers/MakerMiniHistory";

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Loader2, User, Building, Phone, Mail, Fingerprint, MapPin, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import config from '@/lib/config';


const cifSchema = z.object({
  branch_code: z.string().min(1, 'Branch code is required'),
  customer_id: z.string().min(1, 'Customer ID/CIF is required'),
});

const customerDetailsSchema = z.object({
    full_name: z.string(),
    cif_creation_date: z.string(),
    customer_number: z.string(),
    date_of_birth: z.string(),
    gender: z.string(),
    email_id: z.string().email(),
    mobile_number: z.string(),
    address_line_1: z.string(),
    address_line_2: z.string().optional(),
    address_line_3: z.string().optional(),
    address_line_4: z.string().optional(),
    country: z.string(),
    branch: z.string(),
});

type CustomerDetails = z.infer<typeof customerDetailsSchema>;

export default function CreateCustomerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cifSchema>>({
    resolver: zodResolver(cifSchema),
    defaultValues: {
      branch_code: '',
      customer_id: '',
    },
  });

  async function onCifSubmit(values: z.infer<typeof cifSchema>) {
    setIsLoading(true);
    setCustomer(null);
    try {
        const response = await fetch('/api/online-linking/find-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            const rawText = await response.text();
            throw new Error(`Server returned non-JSON response (${response.status}): ${rawText.slice(0, 100)}`);
        }

        if (!response.ok) {
            throw new Error(result?.message || `Failed to fetch customer details (${response.status})`);
        }

        if (result) {
            setCustomer(result);
            toast({
                title: 'Customer Found',
                description: `Displaying details for ${result.full_name}.`,
            });
        }
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Could Not Fetch Customer',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleNext = () => {
    if (customer) {
        const params = new URLSearchParams({
            customer: JSON.stringify(customer)
        });
        router.push(`/customers/create/select-accounts?${params.toString()}`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-3xl">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Customer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Register a new customer for Mobile Banking.
        </p>
      </div>

      <MakerMiniHistory approvalType="new-customer" />

      <Card className="flex-grow flex flex-col glass-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl font-bold">
            Step 1: Customer Details
          </CardTitle>
          <CardDescription>
            Enter the Branch Code and CIF number to fetch customer details. The system will first check if the customer is already registered.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCifSubmit)} className="flex items-start gap-4 mb-8 max-w-xl">
              <FormField
                control={form.control}
                name="branch_code"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Branch Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Customer ID (CIF)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter CIF number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="font-medium mt-8" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Details
              </Button>
            </form>
          </Form>

          {customer && (
            <div className="animate-in fade-in-50 space-y-6">
                <Separator />
                <h3 className="text-lg font-semibold text-foreground">Customer Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-lg border p-6">
                    <InfoItem icon={<User />} label="Full Name" value={customer.full_name} />
                    <div className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1 transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Phone className="h-4 w-4" /></div>
                        <div className="flex-grow">
                            <label className="text-sm font-medium text-foreground mb-1 block">Phone Number</label>
                            <Input
                                value={customer.mobile_number || ''}
                                onChange={(e) => setCustomer({ ...customer, mobile_number: e.target.value })}
                                className="h-10 text-sm px-3 rounded-xl border-muted bg-background/50 hover:bg-accent/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary shadow-sm"
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                    <div className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1 transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Mail className="h-4 w-4" /></div>
                        <div className="flex-grow">
                            <label className="text-sm font-medium text-foreground mb-1 block">Email Address</label>
                            <Input
                                value={customer.email_id || ''}
                                onChange={(e) => setCustomer({ ...customer, email_id: e.target.value })}
                                className="h-10 text-sm px-3 rounded-xl border-muted bg-background/50 hover:bg-accent/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary shadow-sm"
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>
                    <InfoItem icon={<User />} label="Gender" value={customer.gender} />
                    <InfoItem icon={<Fingerprint />} label="Date of Birth" value={new Date(customer.date_of_birth).toLocaleDateString()} />
                    <InfoItem icon={<Building />} label="Home Branch" value={customer.branch} />
                    <InfoItem icon={<MapPin />} label="Address" value={`${customer.address_line_1}, ${customer.address_line_2}, ${customer.address_line_3}`} className="lg:col-span-2" />
                    <InfoItem icon={<Globe />} label="Country" value={customer.country} />
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleNext}>Next: Select Accounts</Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ icon, label, value, className }: { icon: React.ReactNode, label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex items-start gap-4", className)}>
            <div className="w-6 h-6 text-muted-foreground mt-1">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
}
