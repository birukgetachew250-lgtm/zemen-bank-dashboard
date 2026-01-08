
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Info, Bell, Search } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type AlertSeverity = 'Critical' | 'Warning' | 'Info';
interface AlertItem {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  service: string;
  message: string;
  status: 'Active' | 'Resolved';
}
const mockAlerts: AlertItem[] = [
  { id: 'al1', timestamp: new Date(), severity: 'Critical', service: 'Remittance Gateway', message: 'Service is down. No response for 5m.', status: 'Active' },
  { id: 'al2', timestamp: new Date(Date.now() - 5 * 60000), severity: 'Warning', service: 'Payments Service', message: 'Latency p99 over 800ms.', status: 'Active' },
  { id: 'al3', timestamp: new Date(Date.now() - 10 * 60000), severity: 'Warning', service: 'Fraud Detection Engine', message: 'High rate of false positives.', status: 'Resolved' },
  { id: 'al4', timestamp: new Date(Date.now() - 30 * 60000), severity: 'Info', service: 'Auth Service', message: 'New version 1.2.4 deployed.', status: 'Resolved' },
];

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
interface LogItem {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  traceId?: string;
}
const mockLogs: LogItem[] = [
    { id: 'log1', timestamp: new Date(), level: 'ERROR', service: 'interop-switch', message: 'Connection timeout to provider XYZ', traceId: 'trace-456-def' },
    { id: 'log2', timestamp: new Date(Date.now() - 1 * 60000), level: 'WARN', service: 'wallets', message: 'Balance below threshold for account 12345' },
    { id: 'log3', timestamp: new Date(Date.now() - 2 * 60000), level: 'INFO', service: 'auth', message: 'User 5678 logged in successfully', traceId: 'trace-123-abc' },
    { id: 'log4', timestamp: new Date(Date.now() - 3 * 60000), level: 'DEBUG', service: 'transfers', message: 'Payload received for transfer' },
];

const severityConfig: { [key in AlertSeverity]: { Icon: React.ElementType, color: string } } = {
  'Critical': { Icon: AlertCircle, color: 'bg-red-500' },
  'Warning': { Icon: AlertCircle, color: 'bg-yellow-500' },
  'Info': { Icon: Info, color: 'bg-blue-500' },
};
const logLevelConfig: { [key in LogLevel]: { color: string } } = {
  'ERROR': { color: 'text-red-500' },
  'WARN': { color: 'text-yellow-500' },
  'INFO': { color: 'text-blue-500' },
  'DEBUG': { color: 'text-gray-500' },
};

export default function AlertsCenterPage() {
    const [logQuery, setLogQuery] = useState('');
  return (
    <Tabs defaultValue="alerts" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="alerts"><Bell className="mr-2"/>Alerts & Notifications</TabsTrigger>
        <TabsTrigger value="logs"><Search className="mr-2"/>Logs Explorer</TabsTrigger>
      </TabsList>
      <TabsContent value="alerts">
        <Card>
            <CardHeader>
                <CardTitle>Alerts & Notifications Center</CardTitle>
                <CardDescription>A central place for real-time incidents and deep-dive log analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Severity</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAlerts.map(alert => {
                             const { Icon, color } = severityConfig[alert.severity];
                             return (
                                <TableRow key={alert.id} className={cn(alert.status === 'Active' && 'bg-muted/50')}>
                                    <TableCell>
                                        <Badge className={cn("text-white", color)}><Icon className="h-3 w-3 mr-1" />{alert.severity}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{alert.service}</TableCell>
                                    <TableCell>{alert.message}</TableCell>
                                    <TableCell>{format(alert.timestamp, 'HH:mm:ss')}</TableCell>
                                    <TableCell>
                                        <Badge variant={alert.status === 'Active' ? 'outline' : 'secondary'}>{alert.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {alert.status === 'Active' ? (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline">Acknowledge</Button>
                                                <Button size="sm">Resolve</Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" disabled>View</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="logs">
         <Card>
            <CardHeader>
                <CardTitle>Logs Explorer</CardTitle>
                <CardDescription>A powerful interface to search, filter, and analyze structured application logs.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-4 mb-4">
                    <Input
                        placeholder='Search logs (e.g., level:ERROR service:payments "user 123")'
                        value={logQuery}
                        onChange={(e) => setLogQuery(e.target.value)}
                        className="flex-grow"
                    />
                    <Button><Search className="mr-2"/>Search</Button>
                </div>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Timestamp</TableHead>
                            <TableHead className="w-[100px]">Level</TableHead>
                            <TableHead className="w-[180px]">Service</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-[150px]">Trace ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {mockLogs.map(log => {
                            const { color } = logLevelConfig[log.level];
                            return (
                                <TableRow key={log.id}>
                                    <TableCell>{format(log.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("font-bold", color, `border-current`)}>{log.level}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.service}</TableCell>
                                    <TableCell><pre className="text-xs whitespace-pre-wrap">{log.message}</pre></TableCell>
                                    <TableCell className="font-mono text-xs">{log.traceId}</TableCell>
                                </TableRow>
                            )
                       })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
