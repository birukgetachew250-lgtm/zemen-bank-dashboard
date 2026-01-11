
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
import { User, Landmark, Activity, Smartphone, Shield, Edit, Ban, History, Unlink, Link } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

function CustomerDetailsPageContent({ customerId }: { customerId: string }) {
    const [customer, setCustomer] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const customerRes = await fetch(`/api/customers/${customerId}`);
                if (!customerRes.ok) throw new Error("Customer not found");
                const customerData = await customerRes.json();
                setCustomer(customerData);

                const accountsRes = await fetch(`/api/customers/${customerId}/accounts`);
                if (!accountsRes.ok) throw new Error("Could not fetch accounts");
                const accountsData = await accountsRes.json();
                setAccounts(accountsData);

            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error", description: error.message });
                // router.push('/customers'); // Redirect if customer not found
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [customerId, toast, router]);

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

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    
    if (!customer) {
        return notFound();
    }

    const fullName = customer.name;

  return (
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
                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
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
  );
}

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className={className}>{value}</div>
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
