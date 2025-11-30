
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
import { Loader2, User, Building, Phone } from 'lucide-react';
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
});

type CustomerDetails = z.infer<typeof customerDetailsSchema>;

// Mock function to simulate fetching customer data from a core banking API
const fetchCustomerByCif = async (cif: string): Promise<CustomerDetails | null> => {
    console.log(`Fetching customer with CIF: ${cif}`);
    // In a real app, this would be an API call.
    // For this prototype, we'll return mock data if the CIF is '1002345'
    if (cif === '1002345') {
        return {
            cif: '1002345',
            name: 'John Adebayo Doe',
            phoneNumber: '+2348012345678',
            branchName: 'Head Office',
            email: 'john.doe@example.com'
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
      <Card className="w-full max-w-3xl">
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
                      <Input placeholder="e.g., 1002345" {...field} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-lg border p-6">
                    <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-medium">{customer.name}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Phone Number</p>
                            <p className="font-medium">{customer.phoneNumber}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Building className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Home Branch</p>
                            <p className="font-medium">{customer.branchName}</p>
                        </div>
                    </div>
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
