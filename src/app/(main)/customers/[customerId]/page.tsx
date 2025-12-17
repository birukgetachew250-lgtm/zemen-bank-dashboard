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
import { User, Landmark, Activity, Smartphone, Shield, Edit, Ban, History } from "lucide-react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";


const getCustomerById = (id: string) => {
    // This is a mock data fetch. In a real app, you would query your database.
    // For this prototype, we'll return a mock customer object if the id is known.
    const mockCustomers: {[key: string]: any} = {
        'cust_1': {
            id: "cust_1",
            cifNumber: "1002345",
            firstName: "John",
            secondName: "Adebayo",
            lastName: "Doe",
            email: "john.doe@example.com",
            phoneNumber: "+2348012345678",
            address: "123, Main Street, Victoria Island, Lagos, Nigeria",
            nationality: "Nigerian",
            branchCode: "001",
            branchName: "Head Office",
            status: "Active",
            signUp2FA: "SMS_OTP",
            signUpMainAuth: "PIN",
            insertDate: "2022-08-15T10:30:00Z",
            avatarUrl: "https://picsum.photos/seed/customer1/100/100"
        },
    };
    
    // For any other ID, we can derive it from the db
    const customerFromDb = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (customerFromDb) {
        return {
             id: customerFromDb.id,
            cifNumber: "CIF" + customerFromDb.id.substring(4, 10),
            firstName: customerFromDb.name.split(' ')[0],
            secondName: customerFromDb.name.split(' ')[1] || '',
            lastName: customerFromDb.name.split(' ')[2] || '',
            email: `${customerFromDb.name.split(' ')[0].toLowerCase()}@example.com`,
            phoneNumber: customerFromDb.phone,
            address: "123, Mock Street, Addis Ababa",
            nationality: "Ethiopian",
            branchCode: "101",
            branchName: "Main Branch",
            status: customerFromDb.status,
            signUp2FA: "SMS_OTP",
            signUpMainAuth: "PIN",
            insertDate: customerFromDb.registeredAt,
            avatarUrl: `https://picsum.photos/seed/${customerFromDb.id}/100/100`
        }
    }


    return mockCustomers[id] || null;
}


const accounts = [
    { id: "acc_1", accountNumber: "0012345678", accountType: "Savings", currency: "NGN", status: "Active", branchName: "Head Office" },
    { id: "acc_2", accountNumber: "0087654321", accountType: "Current", currency: "NGN", status: "Active", branchName: "Head Office" },
    { id: "acc_3", accountNumber: "3012345678", accountType: "Domiciliary", currency: "USD", status: "Dormant", branchName: "VI Branch" },
];

const activityLogs = [
    { id: 1, action: "Logged In", timestamp: "2023-10-27 10:00 AM", ip: "192.168.1.1", device: "iPhone 14 Pro" },
    { id: 2, action: "Fund Transfer", timestamp: "2023-10-27 10:05 AM", details: "Sent ₦50,000 to Jane Smith" },
    { id: 3, action: "PIN Change", timestamp: "2023-10-26 03:20 PM", ip: "105.112.45.67" },
];


const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'secondary';
        case 'dormant': return 'outline';
        case 'frozen': return 'destructive';
        default: return 'default';
    }
}


export default function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
    const customer = getCustomerById(params.customerId);

    if (!customer) {
        notFound();
    }

    const fullName = `${customer.firstName} ${customer.secondName} ${customer.lastName}`;

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
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700"><Ban className="mr-2 h-4 w-4" /> Suspend</Button>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((acc) => (
                            <TableRow key={acc.id}>
                                <TableCell className="font-medium">{acc.accountNumber}</TableCell>
                                <TableCell>{acc.accountType}</TableCell>
                                <TableCell>{acc.currency}</TableCell>
                                <TableCell>{acc.branchName}</TableCell>
                                <TableCell>
                                     <Badge 
                                        variant={getStatusVariant(acc.status)}
                                        className={acc.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                     >{acc.status}</Badge>
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
                <div className="flex justify-start gap-2">
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
