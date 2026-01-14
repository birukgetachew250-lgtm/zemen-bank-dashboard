
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Power, Edit, Save, TestTube2, RotateCw, Loader2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Integration {
    id: number;
    name: string;
    type: 'WSO2' | 'Flexcube' | 'SMS';
    baseUrl: string;
    username?: string | null;
    password?: string | null;
    status: 'Connected' | 'Disconnected';
    isProduction: boolean;
}

const statusConfig: { [key in Integration['status']]: { Icon: React.ElementType, color: string } } = {
  'Connected': { Icon: CheckCircle, color: 'text-green-500' },
  'Disconnected': { Icon: XCircle, color: 'text-red-500' },
};

export default function IntegrationConfigPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const fetchIntegrations = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/integrations');
            if (!res.ok) throw new Error("Failed to fetch integrations.");
            const data = await res.json();
            setIntegrations(data);
            if (data.length > 0 && !selectedIntegration) {
                setSelectedIntegration(data[0]);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [toast, selectedIntegration]);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const handleSave = async () => {
      if (!selectedIntegration) return;
      setIsSaving(true);
      try {
        const res = await fetch('/api/integrations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIntegration)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        toast({ title: 'Success', description: 'Configuration saved successfully.' });
        fetchIntegrations(); // Refresh the list
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
      } finally {
        setIsSaving(false);
      }
    };
    
    const handleFieldChange = (field: keyof Integration, value: any) => {
        if (selectedIntegration) {
            setSelectedIntegration({ ...selectedIntegration, [field]: value });
        }
    };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>Integration Services</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {integrations.map(p => {
                            const { Icon, color } = statusConfig[p.status];
                            return (
                                <TableRow key={p.id} onClick={() => setSelectedIntegration(p)} className={cn("cursor-pointer", selectedIntegration?.id === p.id && "bg-muted/50")}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{p.name}</span>
                                            <span className="text-xs text-muted-foreground">{p.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Icon className={cn("h-4 w-4", color)} />
                                            <span>{p.status}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
      
        <Card className="lg:col-span-2 flex flex-col">
           {isLoading ? (
               <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
           ) : selectedIntegration ? (
            <div className="flex flex-col h-full">
                <CardHeader>
                    <div>
                        <CardTitle>{selectedIntegration.name} Configuration</CardTitle>
                        <CardDescription>Manage API endpoints, credentials, and settings for this integration.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                    <ConfigItem label="Base URL">
                        <Input value={selectedIntegration.baseUrl} onChange={(e) => handleFieldChange('baseUrl', e.target.value)} />
                    </ConfigItem>
                    
                    {selectedIntegration.type !== 'Flexcube' && (
                        <>
                            <ConfigItem label="Username">
                                <Input value={selectedIntegration.username || ''} onChange={(e) => handleFieldChange('username', e.target.value)} />
                            </ConfigItem>
                            <ConfigItem label="Password">
                                <Input type="password" value={selectedIntegration.password || ''} onChange={(e) => handleFieldChange('password', e.target.value)} />
                            </ConfigItem>
                        </>
                    )}

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                        <FormLabel>Production Mode</FormLabel>
                        <FormDescription>Toggle between test and production environments.</FormDescription>
                        </div>
                        <Switch checked={selectedIntegration.isProduction} onCheckedChange={(checked) => handleFieldChange('isProduction', checked)} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button variant="secondary"><TestTube2 className="mr-2"/> Test Connection</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Configuration
                    </Button>
                </CardFooter>
            </div>
           ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Select a service to configure.</div>
           )}
        </Card>
    </div>
  );
}

const ConfigItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right">{label}</Label>
        <div className="col-span-2">{children}</div>
    </div>
);

const FormLabel = ({ children }: { children: React.ReactNode}) => (
    <p className="text-sm font-medium leading-none">{children}</p>
);

const FormDescription = ({ children }: { children: React.ReactNode}) => (
    <p className="text-sm text-muted-foreground">{children}</p>
);

```</content>
  </change>
  <change>
    <file>prisma/schema.prisma</file>
    <content><![CDATA[datasource db {
  provider = "postgresql"
  url      = env("DASH_MODULE_PROD_DATABASE_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]
}

// Separate client for system-level data, if needed
generator system {
  provider = "prisma-client-js"
  output   = "./system-client"
}

model User {
  id         Int      @id @default(autoincrement())
  employeeId String   @unique
  name       String
  email      String   @unique
  password   String // In a real app, this would be a hash
  role       String
  branch     String?
  department String
  mfaEnabled Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Role {
  id          Int    @id @default(autoincrement())
  name        String @unique
  description String
}

model Branch {
  id          String       @id @unique
  name        String       @unique
  location    String
  createdAt   DateTime     @default(now())
  departments Department[]
}

model Department {
  id        String   @id @unique
  name      String   @unique
  branch    Branch   @relation(fields: [branchId], references: [id])
  branchId  String
  createdAt DateTime @default(now())
}

model Customer {
  id           Int               @id @default(autoincrement())
  name         String
  phone        String            @unique
  status       String
  registeredAt DateTime          @default(now())
  transactions Transaction[]
  approvals    PendingApproval[]
}

model PendingApproval {
  id            Int      @id @default(autoincrement())
  customerId    Int
  customer      Customer @relation(fields: [customerId], references: [id])
  type          String // e.g. new-customer, pin-reset, suspend
  requestedAt   DateTime @default(now())
  customerName  String
  customerPhone String
  details       String?
  status        String   @default("pending") // pending, approved, rejected
}

model Transaction {
  id             String   @id @default(cuid())
  customerId     Int
  customer       Customer @relation(fields: [customerId], references: [id])
  amount         Float
  fee            Float
  status         String
  timestamp      DateTime @default(now())
  type           String
  channel        String
  from_account   String?
  to_account     String?
  is_anomalous   Boolean  @default(false)
  anomaly_reason String?
}

model Corporate {
  id                      String @id @unique
  name                    String
  industry                String
  status                  String
  internet_banking_status String
  logo_url                String
}

model MiniApp {
  id             String @id @default(cuid())
  name           String
  url            String
  logo_url       String
  username       String
  password       String
  encryption_key String
}

model SystemActivityLog {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())
  userEmail String
  action    String
  status    String
  details   String?
  ipAddress String?
}

model IpWhitelist {
  id        Int      @id @default(autoincrement())
  cidr      String   @unique
  label     String
  createdAt DateTime @default(now())
}

model SecurityPolicy {
  id                  Int      @id @default(1)
  mfaRequired         Boolean  @default(true)
  allowedMfaMethods   String[] @default(["email"])
  sessionTimeout      Int      @default(30) // in minutes
  concurrentSessions  Int      @default(1) // 0 for unlimited
}

model Integration {
  id            Int    @id @default(autoincrement())
  name          String @unique
  type          String // 'WSO2', 'Flexcube', 'SMS'
  baseUrl       String
  username      String?
  password      String? // Encrypted
  status        String @default("Disconnected")
  isProduction  Boolean @default(false)
}

// The models below are managed in separate Oracle databases
// and are removed from this schema to avoid conflicts.
// AppUser, Account, SecurityQuestion, UserSecurity, OtpCode
