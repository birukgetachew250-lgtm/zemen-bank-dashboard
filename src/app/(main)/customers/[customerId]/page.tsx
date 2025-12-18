

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
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import config from "@/lib/config";
import { decrypt } from "@/lib/crypto";


const getCustomerById = (id: string) => {
    let customerFromDb;
    if (config.db.isProduction) {
        // Case-sensitive query for Oracle
        customerFromDb = db.prepare('SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName", "Email", "PhoneNumber", "AddressLine1", "AddressLine2", "AddressLine3", "AddressLine4", "Nationality", "BranchCode", "BranchName", "Status", "SignUp2FA", "SignUpMainAuth", "InsertDate" FROM "USER_MODULE"."AppUsers" WHERE "Id" = :1 OR "CIFNumber" = :2').get(id, id);
    } else {
        customerFromDb = db.prepare('SELECT * FROM AppUsers WHERE Id = ? OR CIFNumber = ?').get(id, id);
    }

    if (customerFromDb) {
        // Handle Oracle's uppercase column names
        const d = customerFromDb;
        const firstName = decrypt(d.FirstName || d.FIRSTNAME);
        const secondName = decrypt(d.SecondName || d.SECONDNAME);
        const lastName = decrypt(d.LastName || d.LASTNAME);
        const email = decrypt(d.Email || d.EMAIL);
        const phoneNumber = decrypt(d.PhoneNumber || d.PHONENUMBER);

        return {
            id: d.Id || d.ID,
            cifNumber: d.CIFNumber || d.CIFNUMBER,
            name: [firstName, secondName, lastName].filter(Boolean).join(' '),
            email: email,
            phoneNumber: phoneNumber,
            address: `${d.AddressLine1 || d.ADDRESSLINE1 || ''}, ${d.AddressLine2 || d.ADDRESSLINE2 || ''}`,
            nationality: d.Nationality || d.NATIONALITY,
            branchCode: d.BranchCode || d.BRANCHCODE,
            branchName: d.BranchName || d.BRANCHNAME,
            status: d.Status || d.STATUS,
            signUp2FA: d.SignUp2FA || d.SIGNUP2FA,
            signUpMainAuth: d.SignUpMainAuth || d.SIGNUPMAINAUTH,
            insertDate: d.InsertDate || d.INSERTDATE,
            avatarUrl: `https://picsum.photos/seed/${d.Id || d.ID}/100/100`
        }
    }
    return null;
}


const getAccountsByCif = (cif: string) => {
    let accountsFromDb;
    if (config.db.isProduction) {
        // Case-sensitive query for Oracle
        accountsFromDb = db.prepare('SELECT "Id", "AccountNumber", "AccountType", "Currency", "BranchName", "Status" FROM "USER_MODULE"."Accounts" WHERE "CIFNumber" = :1').all(cif);
    } else {
        accountsFromDb = db.prepare('SELECT * FROM Accounts WHERE CIFNumber = ?').all(cif);
    }

    if (!accountsFromDb || !Array.isArray(accountsFromDb)) {
        return [];
    }
    
    return accountsFromDb.map((acc: any) => {
        return {
            id: acc.Id || acc.ID,
            accountNumber: decrypt(acc.AccountNumber || acc.ACCOUNTNUMBER),
            accountType: decrypt(acc.AccountType || acc.ACCOUNTTYPE),
            currency: decrypt(acc.Currency || acc.CURRENCY),
            branchName: acc.BranchName || acc.BRANCHNAME,
            status: acc.Status || acc.STATUS,
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


export default function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
    const customer = getCustomerById(params.customerId);

    if (!customer) {
        notFound();
    }
    
    const accounts = getAccountsByCif(customer.cifNumber);

    const fullName = customer.name;

  return (
    <div className="w-full space-y-6">
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image
                        src={customer.avatarUrl}
                        alt={`${fullName} avatar`}
                        width={80}
                        height={80}
                        className="rounded-full border"
                    />
                    <div>
                        <CardTitle className="text-3xl font-bold font-headline">{fullName}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">CIF: {customer.cifNumber}</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700"><Ban className="mr-2 h-4 w-4" /> Block App User</Button>
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
                    <Button>Reset PIN</Button>
                    <Button variant="outline">Reset Security Questions</Button>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">Force Logout</Button>
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

    

    
