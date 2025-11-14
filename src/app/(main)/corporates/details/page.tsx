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
import { Download, Edit, FileText, User, Shield, Users } from "lucide-react";

// Mock data for a single corporate client
const corporate = {
  id: "corp_1",
  name: "Dangote Cement",
  industry: "Manufacturing",
  status: "Active",
  internet_banking_status: "Active",
  logo_url: "https://picsum.photos/seed/dangote/100/100",
  address: "123 Industrial Ave, Lagos, Nigeria",
  phone: "+234 1 234 5678",
  email: "contact@dangotecement.com",
  registeredAt: "2020-01-15T09:00:00Z",
  relationshipManager: "Aisha Bello",
  accountNumber: "0123456789",
  accountBalance: "₦ 1,250,000,000.00",
};

const documents = [
  { id: 1, name: "Certificate of Incorporation", type: "PDF", uploadedAt: "2020-01-14" },
  { id: 2, name: "Memorandum of Association", type: "PDF", uploadedAt: "2020-01-14" },
  { id: 3, name: "Board Resolution", type: "DOCX", uploadedAt: "2022-03-10" },
];

const signatories = [
    { id: 1, name: "Aliko Dangote", role: "Chairman", email: "a.dangote@dangotecement.com" },
    { id: 2, name: "Olukunle Alake", role: "Group Managing Director", email: "o.alake@dangotecement.com" },
    { id: 3, name: "Fatima Aliko-Dangote", role: "Director", email: "f.dangote@dangotecement.com" },
];


export default function CorporateDetailsPage() {
  return (
    <div className="space-y-6">
       <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                <Image
                    src={corporate.logo_url}
                    alt={`${corporate.name} logo`}
                    width={80}
                    height={80}
                    className="rounded-lg border"
                />
                <div>
                    <CardTitle className="text-3xl font-bold font-headline">{corporate.name}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">{corporate.industry}</CardDescription>
                </div>
                </div>
                <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </CardHeader>
       </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <User className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="signatories">
            <Users className="mr-2" />
            Signatories
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardContent className="grid gap-6 p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem label="Status" value={<Badge variant={corporate.status === 'Active' ? 'secondary' : 'destructive'} className="bg-green-100 text-green-800 border-green-200">{corporate.status}</Badge>} />
                <InfoItem label="Internet Banking" value={<Badge variant={corporate.internet_banking_status === 'Active' ? 'secondary' : 'destructive'} className="bg-green-100 text-green-800 border-green-200">{corporate.internet_banking_status}</Badge>} />
                <InfoItem label="Relationship Manager" value={corporate.relationshipManager} />
                <InfoItem label="Contact Email" value={corporate.email} />
                <InfoItem label="Contact Phone" value={corporate.phone} />
                <InfoItem label="Address" value={corporate.address} className="lg:col-span-2" />
                 <InfoItem label="Date Registered" value={new Date(corporate.registeredAt).toLocaleDateString()} />
              </div>
              <Separator />
               <div className="grid md:grid-cols-2 gap-6">
                 <InfoItem label="Account Number" value={corporate.accountNumber} />
                 <InfoItem label="Account Balance" value={corporate.accountBalance} className="font-bold text-lg" />
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>Attached Documents</CardTitle>
                <CardDescription>Official documents related to the corporate client.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>File Type</TableHead>
                            <TableHead>Uploaded On</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                                <TableCell>{doc.uploadedAt}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatories" className="mt-6">
          <Card>
             <CardHeader>
                <CardTitle>Authorized Signatories</CardTitle>
                <CardDescription>Individuals authorized to perform actions on behalf of the corporate.</CardDescription>
            </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {signatories.map((sig) => (
                            <TableRow key={sig.id}>
                                <TableCell className="font-medium">{sig.name}</TableCell>
                                <TableCell>{sig.role}</TableCell>
                                <TableCell>{sig.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                 <CardDescription>Key compliance and verification checks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoItem label="KYC Status" value={<Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>} />
                    <InfoItem label="AML Risk Score" value={<Badge variant="outline">Low</Badge>} />
                    <InfoItem label="FATCA Status" value={<Badge className="bg-green-100 text-green-800 border-green-200">Compliant</Badge>} />
                </div>
                <Separator />
                <div className="flex justify-end">
                    <Button variant="outline">Generate Compliance Report</Button>
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
            <p className={className}>{value}</p>
        </div>
    )
}
