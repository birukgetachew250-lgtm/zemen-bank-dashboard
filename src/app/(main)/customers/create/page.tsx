
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { credentials } from '@grpc/grpc-js';

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

// Assuming you have a generated client from your proto file
// e.g., using @grpc/grpc-js and @grpc/proto-loader
// This is a placeholder for the actual generated client
// import { AccountDetailServiceClient } from './generated/accountdetail_grpc_pb';
// import { ServiceRequest } from './generated/common_pb';

// Mock client for demonstration until real one is available
class MockAccountDetailServiceClient {
    constructor(url: string, creds: any) {}
    QueryCustomerDetails(request: any, callback: (err: any, res: any) => void) {
        // This is where the actual gRPC call would be made
        console.log("Making mock gRPC call with request:", request.toObject());
        
        const customer_id = JSON.parse(request.getPayload()).customer_id;
        
        if (customer_id === '0048533') {
             callback(null, { 
                getPayload: () => JSON.stringify({
                    customer: {
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
                    },
                    status: "SUCCESS",
                    message: "Customer found"
                })
            });
        } else {
            callback({ message: "Customer not found" }, null);
        }
    }
}
const AccountDetailServiceClient = MockAccountDetailServiceClient;
const ServiceRequest = class {
    private payload: string;
    constructor() { this.payload = ''; }
    setPayload(p: string) { this.payload = p; }
    getPayload() { return this.payload; }
    toObject() { return { payload: this.payload }; }
};


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

// This function simulates calling an external service (e.g., Flexcube via gRPC)
const queryCustomerDetails = async (branch_code: string, customer_id: string): Promise<CustomerDetails | null> => {
    console.log(`Querying Flexcube with Branch: ${branch_code}, CIF: ${customer_id}`);
    
    // If IS_PRODUCTION_GRPC is true, you would make a real gRPC call here.
    if (config.grpc.isProduction) {
        if (!config.grpc.url) {
            throw new Error("gRPC URL is not configured in environment variables.");
        }
        console.log(`Making a real gRPC call to ${config.grpc.url}...`);
        
        const client = new AccountDetailServiceClient(config.grpc.url, credentials.createInsecure());
        
        return new Promise((resolve, reject) => {
            const request = new ServiceRequest();
            request.setPayload(JSON.stringify({
                serviceName: "accountdetail",
                requestBody: { branch_code, customer_id }
            }));

            client.QueryCustomerDetails(request, (err: any, response: any) => {
                if (err) {
                    console.error("gRPC Error:", err);
                    return reject(err);
                }
                
                const payload = JSON.parse(response.getPayload());

                if (payload.status === 'SUCCESS' && payload.customer) {
                    console.log("gRPC Success:", payload.customer);
                    resolve(payload.customer);
                } else {
                    console.error("gRPC call failed with message:", payload.message);
                    resolve(null);
                }
            });
        });
    }

    // If IS_PRODUCTION_GRPC is false, use demo data.
    console.log("Using demo data for customer details query.");
    if (customer_id === '0048533') {
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
                description: config.grpc.isProduction 
                    ? 'Could not fetch customer from the live service.' 
                    : 'No demo customer found with the provided CIF number.',
            });
        }
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not fetch customer details.',
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
    <div className="w-full h-full flex flex-col">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl font-bold">
            Onboard New Customer for Mobile Banking
          </CardTitle>
          <CardDescription>
            Step 1: Enter the Branch Code and CIF number to fetch customer details from Flexcube.
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
                    <InfoItem icon={<Phone />} label="Phone Number" value={customer.mobile_number} />
                    <InfoItem icon={<Mail />} label="Email Address" value={customer.email_id} />
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

