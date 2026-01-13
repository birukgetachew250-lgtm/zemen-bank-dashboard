
'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Landmark, Activity, Smartphone, Shield, Edit, History, Unlink } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const activityLogs = [
    { id: 1, action: "Logged In", timestamp: "2023-10-27 10:00 AM", ip: "192.168.1.1", device: "iPhone 14 Pro" },
    { id: 2, action: "Fund Transfer", timestamp: "2023-10-27 10:05 AM", details: "Sent ₦50,000 to Jane Smith" },
    { id: 3, action: "PIN Change", timestamp: "2023-10-26 03:20 PM", ip: "105.112.45.67" },
];

const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active': return 'secondary';
        case 'dormant': return 'outline';
        case 'frozen':
        case 'inactive':
             return 'destructive';
        default: return 'default';
    }
}

const authMethods = [
  { value: 'PIN', label: 'PIN Code' },
  { value: 'SMSOTP', label: 'SMS OTP' },
  { value: 'GAUTH', label: 'Google Authenticator' },
  { value: 'EMAILOTP', label: 'Email OTP' },
];

const editProfileSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  signUpMainAuth: z.string().min(1, 'Primary authentication method is required.'),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;


function CustomerDetailsPageContent({ customerId }: { customerId: string }) {
    const [customer, setCustomer] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<EditProfileFormValues>();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const customerRes = await fetch(`/api/customers/${customerId}`);
                if (!customerRes.ok) throw new Error("Customer not found");
                const customerData = await customerRes.json();
                setCustomer(customerData);
                form.reset(customerData);

                const accountsRes = await fetch(`/api/customers/${customerId}/accounts`);
                if (!accountsRes.ok) throw new Error("Could not fetch accounts");
                const accountsData = await accountsRes.json();
                setAccounts(accountsData);

            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error", description: error.message });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [customerId, toast, router, form]);
    
    const handleUnlink = async (accountNumber: string) => {
        if (!customer) return;

        try {
            const response = await fetch('/api/approvals/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cif: customer.cifNumber,
                    type: 'unlink-account',
                    customerName: customer.name,
                    customerPhone: customer.phoneNumber,
                    details: { accountNumber }
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to request account unlinking');
            }
            toast({
                title: "Request Submitted",
                description: `Request to unlink account ${accountNumber} has been sent for approval.`
            });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Action Failed", description: error.message });
        }
    };
    
    const onEditSubmit = async (values: EditProfileFormValues) => {
        const changes = {
          email: { old: customer.email, new: values.email },
          phoneNumber: { old: customer.phoneNumber, new: values.phoneNumber },
          signUpMainAuth: { old: customer.signUpMainAuth, new: values.signUpMainAuth },
        };
        
        try {
            const response = await fetch('/api/approvals/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cif: customer.cifNumber,
                    type: 'updated-customer',
                    customerName: customer.name,
                    customerPhone: customer.phoneNumber, // Use original phone for lookup
                    details: { changes }
                }),
            });
            if (!response.ok) {
                throw new Error((await response.json()).message || 'Failed to submit update for approval.');
            }
            toast({
                title: "Update Request Submitted",
                description: "The requested changes have been sent for approval."
            });
            setIsEditOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Submission Failed", description: error.message });
        }
    }


    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    
    if (!customer) {
        return notFound();
    }

    const fullName = customer.name;

  return (
    <>
    <div className="w-full space-y-6">
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/images/avatar.png" alt={fullName} />
                      <AvatarFallback>{fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl font-bold font-headline">{fullName}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">CIF: {customer.cifNumber}</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                </div>
            </CardHeader>
       </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><User className="mr-2" /> Profile Details</TabsTrigger>
          <TabsTrigger value="accounts"><Landmark className="mr-2" /> Linked Accounts</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="mr-2" /> User Activity</TabsTrigger>
          <TabsTrigger value="security"><Smartphone className="mr-2" /> Device & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
             <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Detailed information about the customer.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem label="Status" value={<Badge className="bg-green-100 text-green-800 border-green-200">{customer.status}</Badge>} />
                <InfoItem label="Email Address" value={customer.email} />
                <InfoItem label="Phone Number" value={customer.phoneNumber} />
                <InfoItem label="Nationality" value={customer.nationality} />
                <InfoItem label="Registered Branch" value={customer.branchName} />
                <InfoItem label="Registration Date" value={new Date(customer.insertDate).toLocaleDateString()} />
                <InfoItem label="Full Address" value={customer.address} className="lg:col-span-3" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>All bank accounts linked to this customer profile.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account Number</TableHead>
                            <TableHead>Account Type</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((acc: any) => (
                            <TableRow key={acc.id}>
                                <TableCell className="font-medium">{acc.accountNumber}</TableCell>
                                <TableCell>{acc.accountType}</TableCell>
                                <TableCell>{acc.currency}</TableCell>
                                <TableCell>{acc.branchName}</TableCell>
                                <TableCell>
                                     <Badge 
                                        variant={getStatusVariant(acc.status)}
                                        className={(acc.status) === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                     >{acc.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleUnlink(acc.accountNumber)}>
                                        <Unlink className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent activities performed by the user on the app.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activityLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.timestamp}</TableCell>
                                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                                <TableCell className="font-medium">{log.details || `From IP: ${log.ip} on ${log.device}`}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className="flex justify-end mt-4">
                    <Button variant="outline"><History className="mr-2 h-4 w-4" /> View Full History</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>Device & Security Management</CardTitle>
                 <CardDescription>Authentication methods and registered devices.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoItem label="Primary Authentication" value={<Badge variant="secondary">{customer.signUpMainAuth}</Badge>} />
                    <InfoItem label="Two-Factor Authentication (2FA)" value={<Badge variant="secondary">{customer.signUp2FA}</Badge>} />
                </div>
                <Separator />
                <div className="flex justify-start gap-2 flex-wrap">
                    <Button variant="outline">Reset Security Questions</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Customer Profile</DialogTitle>
                <DialogDescription>Submit changes for approval.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="signUpMainAuth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Primary Authentication Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a method" />
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
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Submit for Approval</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className={cn("font-medium", className)}>{value}</div>
        </div>
    )
}

export default function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <CustomerDetailsPageContent customerId={params.customerId} />
    </Suspense>
  )
}
