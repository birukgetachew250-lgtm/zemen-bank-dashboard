
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, LogOut } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const mockLogs = [
    { id: 'log_1', ts: new Date(Date.now() - 2 * 60000), user: 'admin@zemenbank.com', action: 'LOGIN_SUCCESS', ip: '196.188.1.5', device: 'Chrome on macOS', status: 'Success' },
    { id: 'log_2', ts: new Date(Date.now() - 5 * 60000), user: 'admin@zemenbank.com', action: 'UPDATE_ROLE', details: 'Changed "Support Staff" permissions', ip: '196.188.1.5', status: 'Success' },
    { id: 'log_3', ts: new Date(Date.now() - 10 * 60000), user: 'abebe.b@zemenbank.com', action: 'LOGIN_FAILED', ip: '105.112.45.67', device: 'Unknown', status: 'Failure', reason: 'Invalid credentials' },
    { id: 'log_4', ts: new Date(Date.now() - 15 * 60000), user: 'haile.g@zemenbank.com', action: 'VIEW_REPORT', details: 'Viewed "Financial Inclusion" report', ip: '196.188.4.12', status: 'Success' },
];

const mockWhitelist = [
    { id: 'ip_1', range: '196.188.1.0/24', label: 'Addis HQ' },
    { id: 'ip_2', range: '10.0.0.0/8', label: 'VPN Primary' },
];

export default function LoginSessionsPage() {
  const [ipRange, setIpRange] = useState('');
  const [ipLabel, setIpLabel] = useState('');

  return (
    <Tabs defaultValue="logs">
        <TabsList className="grid grid-cols-2 w-full max-w-lg">
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="ip">IP Whitelisting</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>System Activity Log</CardTitle>
                    <CardDescription>A comprehensive, filterable audit trail of all administrative actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Input placeholder='Search logs...' className="flex-grow" />
                        <Button><Search className="mr-2" />Search</Button>
                        <Button variant="outline">Export</Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockLogs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{format(log.ts, 'dd MMM, HH:mm:ss')}</TableCell>
                                        <TableCell className="font-medium">{log.user}</TableCell>
                                        <TableCell>
                                            <Badge variant={log.status === 'Failure' ? 'destructive' : 'secondary'}>{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>{log.details || log.reason || 'N/A'}</TableCell>
                                        <TableCell className="font-mono">{log.ip}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="ip" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>IP Whitelisting</CardTitle>
                    <CardDescription>Manage IP address ranges permitted to access this admin panel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
                        <div>
                            <Label className="font-semibold text-red-900 dark:text-red-200">Emergency Lockdown</Label>
                            <p className="text-sm text-red-700 dark:text-red-300">Immediately block all access except from the IP ranges listed below.</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Allowed IP Ranges</h3>
                        <div className="rounded-md border">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Range (CIDR)</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockWhitelist.map(ip => (
                                        <TableRow key={ip.id}>
                                            <TableCell className="font-mono">{ip.range}</TableCell>
                                            <TableCell>{ip.label}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Remove</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                     <Separator />
                     <div className="space-y-4">
                         <h3 className="font-semibold">Add New IP Range</h3>
                         <div className="flex items-end gap-4">
                             <div className="flex-grow">
                                <Label htmlFor="ip-range">IP Range (CIDR format)</Label>
                                <Input id="ip-range" placeholder="e.g., 196.188.10.0/24" value={ipRange} onChange={e => setIpRange(e.target.value)} />
                             </div>
                             <div className="flex-grow">
                                <Label htmlFor="ip-label">Label</Label>
                                <Input id="ip-label" placeholder="e.g., Bole Office WiFi" value={ipLabel} onChange={e => setIpLabel(e.target.value)}/>
                             </div>
                             <Button><PlusCircle className="mr-2"/>Add Range</Button>
                         </div>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
