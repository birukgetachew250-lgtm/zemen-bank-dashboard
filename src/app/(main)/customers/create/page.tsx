
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
  CardFooter,
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

const queryCustomerDetails = async (branch_code: string, customer_id: string): Promise<CustomerDetails | null> => {
    console.log(`Querying Flexcube with Branch: ${branch_code}, CIF: ${customer_id}`);
    if (customer_id) {
        return {
            customer_number: customer_id,
            full_name: 'AKALEWORK TAMENE KEBEDE',
            cif_creation_date: '2022-01-20',
            date_of_birth: '1990-05-15',
            gender: 'Female',
            email_id: 'akalework.t@example.com',
            mobile_number: '+251911223344',
            address_line_1: 'AA, ADDIS KETEMA',
            address_line_2: '06',
            address_line_3: '790',
            address_line_4: '',
            country: 'ETHIOPIA',
            branch: 'ADDIS KETEMA',
        };
    }
    return null;
}

export default function CreateCustomerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cifSchema>>({
    resolver: zodResolver(cifSchema),
    defaultValues: {
      branch_code: '103',
      customer_id: '0048533',
    },
  });

  async function onCifSubmit(values: z.infer<typeof cifSchema>) {
    setIsLoading(true);
    setCustomer(null);
    try {
        const result = await queryCustomerDetails(values.branch_code, values.customer_id);
        if (result) {
            setCustomer(result);
            toast({
                title: 'Customer Found',
                description: `Displaying details for ${result.full_name}.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Customer Not Found',
                description: 'No customer found with the provided CIF number.',
            });
        }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not fetch customer details.',
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
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl font-bold">
            Onboard New Customer for Mobile Banking
          </CardTitle>
          <CardDescription>
            Step 1: Enter the Branch Code and CIF number to fetch customer details from Flexcube.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <InfoItem icon={<Phone />} label="Phone Number" value={customer.mobile_number} />
                    <InfoItem icon={<Mail />} label="Email Address" value={customer.email_id} />
                    <InfoItem icon={<User />} label="Gender" value={customer.gender} />
                    <InfoItem icon={<Fingerprint />} label="Date of Birth" value={new Date(customer.date_of_birth).toLocaleDateString()} />
                    <InfoItem icon={<Building />} label="Home Branch" value={customer.branch} />
                    <InfoItem icon={<MapPin />} label="Address" value={`${customer.address_line_1}, ${customer.address_line_2}, ${customer.address_line_3}`} className="lg:col-span-2" />
                    <InfoItem icon={<Globe />} label="Country" value={customer.country} />
                </div>
                <div className="flex justify-end">
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
