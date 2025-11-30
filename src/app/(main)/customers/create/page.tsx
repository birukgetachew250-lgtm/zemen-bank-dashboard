
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
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

const cifSchema = z.object({
  cif: z.string().min(4, { message: 'CIF number must be at least 4 digits.' }),
});

const customerDetailsSchema = z.object({
    cif: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    branchName: z.string(),
    email: z.string().email(),
    gender: z.string(),
    nationalId: z.string().optional(),
    address: z.string(),
    country: z.string(),
});

type CustomerDetails = z.infer<typeof customerDetailsSchema>;

// Mock function to simulate fetching customer data from a core banking API
const fetchCustomerByCif = async (cif: string): Promise<CustomerDetails | null> => {
    console.log(`Fetching customer with CIF: ${cif}`);
    // In a real app, this would be an API call.
    // For this prototype, we'll return mock data if the CIF is '0048533'
    if (cif === '0048533') {
        return {
            cif: '0048533',
            name: 'AKALEWORK TAMENE KEBEDE',
            phoneNumber: '+251911223344',
            branchName: 'ADDIS KETEMA',
            email: 'akalework.t@example.com',
            gender: 'Female',
            nationalId: '123456789',
            address: 'AA, 06, 790',
            country: 'ETH',
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
      cif: '',
    },
  });

  async function onCifSubmit(values: z.infer<typeof cifSchema>) {
    setIsLoading(true);
    setCustomer(null);
    try {
        const result = await fetchCustomerByCif(values.cif);
        if (result) {
            setCustomer(result);
            toast({
                title: 'Customer Found',
                description: `Displaying details for ${result.name}.`,
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
        // Pass customer data to the next step
        const params = new URLSearchParams(customer);
        router.push(`/customers/create/select-accounts?${params.toString()}`);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl font-bold">
            Onboard New Customer for Mobile Banking
          </CardTitle>
          <CardDescription>
            Step 1: Enter the Customer Information File (CIF) number to fetch their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCifSubmit)} className="flex items-start gap-4 mb-8">
              <FormField
                control={form.control}
                name="cif"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>CIF Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 0048533" {...field} />
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
                    <InfoItem icon={<User />} label="Full Name" value={customer.name} />
                    <InfoItem icon={<Phone />} label="Phone Number" value={customer.phoneNumber} />
                    <InfoItem icon={<Mail />} label="Email Address" value={customer.email} />
                    <InfoItem icon={<User />} label="Gender" value={customer.gender} />
                    {customer.nationalId && <InfoItem icon={<Fingerprint />} label="National ID" value={customer.nationalId} />}
                    <InfoItem icon={<Building />} label="Home Branch" value={customer.branchName} />
                    <InfoItem icon={<MapPin />} label="Address" value={customer.address} className="lg:col-span-2" />
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
