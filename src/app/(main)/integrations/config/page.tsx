
'use client';

import { useState } from 'react';
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
import { CheckCircle, XCircle, Power, Edit, Save, TestTube2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

type PartnerStatus = 'Connected' | 'Disconnected' | 'Degraded';
interface IntegrationPartner {
    id: string;
    name: string;
    type: 'Interop' | 'Bill Pay' | 'Remittance' | 'Government';
    status: PartnerStatus;
    lastPing: string;
    apiVersion: string;
    config: {
        baseUrl: string;
        apiKey: string;
        webhookUrl: string;
        isProduction: boolean;
    }
}

const mockPartners: IntegrationPartner[] = [
    { id: 'ethswitch', name: 'EthSwitch', type: 'Interop', status: 'Connected', lastPing: '5ms', apiVersion: 'v2.1', config: { baseUrl: 'https://api.ethswitch.com.et', apiKey: 'es_prod_abc123xyz', webhookUrl: 'https://zemen.com/api/webhooks/ethswitch', isProduction: true } },
    { id: 'eepco', name: 'EEPCO', type: 'Bill Pay', status: 'Connected', lastPing: '45ms', apiVersion: 'v1.0', config: { baseUrl: 'https://billing.eepco.gov.et', apiKey: 'eepco_xyz', webhookUrl: '', isProduction: true } },
    { id: 'worldremit', name: 'WorldRemit', type: 'Remittance', status: 'Degraded', lastPing: '350ms', apiVersion: 'v3', config: { baseUrl: 'https://api.worldremit.com', apiKey: 'wr_12345', webhookUrl: 'https://zemen.com/api/webhooks/worldremit', isProduction: true } },
    { id: 'moe', name: 'Ministry of Education', type: 'Government', status: 'Disconnected', lastPing: 'N/A', apiVersion: 'v1.2', config: { baseUrl: 'https://api.moe.gov.et', apiKey: 'moe_key', webhookUrl: '', isProduction: false } },
];

const statusConfig: { [key in PartnerStatus]: { Icon: React.ElementType, color: string } } = {
  'Connected': { Icon: CheckCircle, color: 'text-green-500' },
  'Degraded': { Icon: XCircle, color: 'text-yellow-500' },
  'Disconnected': { Icon: XCircle, color: 'text-red-500' },
};

export default function IntegrationConfigPage() {
    const [selectedPartner, setSelectedPartner] = useState<IntegrationPartner>(mockPartners[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>Integration Partners</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Partner</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPartners.map(p => {
                            const { Icon, color } = statusConfig[p.status];
                            return (
                                <TableRow key={p.id} onClick={() => setSelectedPartner(p)} className={cn("cursor-pointer", selectedPartner.id === p.id && "bg-muted/50")}>
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
            </CardContent>
        </Card>
      
        <Card className="lg:col-span-2 flex flex-col">
            <Tabs defaultValue="config" className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{selectedPartner.name} Configuration</CardTitle>
                            <CardDescription>Manage API endpoints, credentials, and settings for this integration.</CardDescription>
                        </div>
                        <TabsList>
                            <TabsTrigger value="config">Configuration</TabsTrigger>
                            <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
                            <TabsTrigger value="logs">Error Logs</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <TabsContent value="config">
                        <div className="space-y-6">
                            <ConfigItem label="Base URL"><Input defaultValue={selectedPartner.config.baseUrl} /></ConfigItem>
                            <ConfigItem label="API Key"><Input type="password" defaultValue={selectedPartner.config.apiKey} /></ConfigItem>
                            <ConfigItem label="Webhook URL"><Input defaultValue={selectedPartner.config.webhookUrl || 'N/A'} /></ConfigItem>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                <FormLabel>Production Mode</FormLabel>
                                <FormDescription>Toggle between test and production environments.</FormDescription>
                                </div>
                                <Switch defaultChecked={selectedPartner.config.isProduction} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="mapping">
                        <p className="text-muted-foreground">Payload field mapping rules will be configured here.</p>
                    </TabsContent>
                    <TabsContent value="logs">
                         <p className="text-muted-foreground">Connection and webhook error logs will be displayed here.</p>
                    </TabsContent>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button variant="destructive"><Power className="mr-2"/> Deactivate</Button>
                    <Button variant="outline"><RotateCw className="mr-2"/> Refresh Status</Button>
                    <Button variant="secondary"><TestTube2 className="mr-2"/> Test Connection</Button>
                    <Button><Save className="mr-2"/> Save Configuration</Button>
                </CardFooter>
            </Tabs>
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
