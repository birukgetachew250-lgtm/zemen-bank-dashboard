

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
import { User, Landmark, Activity, Smartphone, Shield, Edit, Ban, History, Unlink } from "lucide-react";
import { systemDb } from "@/lib/system-db";
import { notFound } from "next/navigation";
import { decrypt } from "@/lib/crypto";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const getCustomerById = async (id: string) => {
    const customerFromDb = await systemDb.appUser.findFirst({
        where: {
            OR: [
                { Id: id },
                { CIFNumber: id }
            ]
        }
    });

    if (customerFromDb) {
        const d = customerFromDb;
        const firstName = decrypt(d.FirstName);
        const secondName = decrypt(d.SecondName);
        const lastName = decrypt(d.LastName);
        const email = decrypt(d.Email);
        const phoneNumber = decrypt(d.PhoneNumber);

        return {
            id: d.Id,
            cifNumber: d.CIFNumber,
            name: [firstName, secondName, lastName].filter(Boolean).join(' '),
            email: email,
            phoneNumber: phoneNumber,
            address: [d.AddressLine1, d.AddressLine2, d.AddressLine3, d.AddressLine4].filter(Boolean).join(', '),
            nationality: d.Nationality,
            branchCode: d.BranchCode,
            branchName: d.BranchName,
            status: d.Status,
            signUp2FA: d.SignUp2FA,
            signUpMainAuth: d.SignUpMainAuth,
            insertDate: d.InsertDate.toISOString(),
        }
    }
    return null;
}


const getAccountsByCif = async (cif: string) => {
    if (!cif) return [];
    const accountsFromDb = await systemDb.account.findMany({
        where: { CIFNumber: cif }
    });
    
    return accountsFromDb.map((acc: any) => {
        return {
            id: acc.Id,
            accountNumber: decrypt(acc.AccountNumber),
            accountType: decrypt(acc.AccountType),
            currency: decrypt(acc.Currency),
            branchName: acc.BranchName,
            status: acc.Status,
        }
    });
}


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


export default async function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
    const customer = await getCustomerById(params.customerId);

    if (!customer) {
        notFound();
    }
    
    const accounts = await getAccountsByCif(customer.cifNumber);

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
                                    <Button variant="ghost" size="icon">
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
