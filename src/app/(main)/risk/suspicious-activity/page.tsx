'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Check, X, Shield, User, HardHat } from "lucide-react";
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

type AlertStatus = 'New' | 'Assigned' | 'In Progress' | 'Resolved';
type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
interface SuspiciousActivityAlert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  type: 'Fraud' | 'AML' | 'Behavioral';
  customer: string;
  rule: string;
  score: number;
  status: AlertStatus;
  assignee?: string;
}

const mockAlerts: SuspiciousActivityAlert[] = [
  { id: 'alert-1', timestamp: new Date(Date.now() - 2 * 60000), severity: 'Critical', type: 'Fraud', customer: '0911223344', rule: 'High Value Tx / New Device', score: 92, status: 'New' },
  { id: 'alert-2', timestamp: new Date(Date.now() - 5 * 60000), severity: 'High', type: 'AML', customer: '0922334455', rule: 'Structuring Pattern', score: 85, status: 'Assigned', assignee: 'Abebe B.' },
  { id: 'alert-3', timestamp: new Date(Date.now() - 10 * 60000), severity: 'Medium', type: 'Behavioral', customer: '0933445566', rule: 'Multiple Failed Logins', score: 65, status: 'In Progress', assignee: 'Tirunesh D.' },
  { id: 'alert-4', timestamp: new Date(Date.now() - 30 * 60000), severity: 'Low', type: 'Fraud', customer: '0944556677', rule: 'Geofence Anomaly', score: 50, status: 'Resolved' },
];

const priorityColors: Record<AlertSeverity, string> = {
  Low: 'bg-gray-500',
  Medium: 'bg-yellow-500',
  High: 'bg-orange-500',
  Critical: 'bg-red-600',
};

const statusColors: Record<AlertStatus, string> = {
  New: 'border-blue-500 text-blue-500',
  Assigned: 'border-purple-500 text-purple-500',
  'In Progress': 'border-yellow-500 text-yellow-500',
  Resolved: 'border-green-500 text-green-500',
};

export default function SuspiciousActivityPage() {
  const [selectedAlert, setSelectedAlert] = useState<SuspiciousActivityAlert | null>(mockAlerts[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Suspicious Activity Alerts</CardTitle>
              <CardDescription>Centralized inbox for all fraud and AML alerts, prioritized for triage.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search alerts..." className="w-64"/>
              <Button variant="outline" size="icon"><SlidersHorizontal /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="rounded-md border h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rule Triggered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAlerts.map(alert => (
                  <TableRow 
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)} 
                    className={cn("cursor-pointer", selectedAlert?.id === alert.id && "bg-muted/50")}
                  >
                    <TableCell><Badge className={cn("text-white", priorityColors[alert.severity])}>{alert.severity}</Badge></TableCell>
                    <TableCell className="font-mono">{alert.customer}</TableCell>
                    <TableCell>{alert.rule}</TableCell>
                    <TableCell><Badge variant="outline" className={cn(statusColors[alert.status])}>{alert.status}</Badge></TableCell>
                    <TableCell>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1 flex flex-col">
        {selectedAlert ? (
          <>
            <CardHeader>
              <CardTitle>Alert Details</CardTitle>
              <CardDescription>ID: {selectedAlert.id}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <InfoItem label="Customer" value={selectedAlert.customer} />
              <InfoItem label="Risk Score" value={selectedAlert.score.toString()} />
              <InfoItem label="Triggered Rule" value={selectedAlert.rule} />
              <InfoItem label="Alert Type" value={selectedAlert.type} />
              <InfoItem label="Status" value={<Badge variant="outline" className={cn(statusColors[selectedAlert.status])}>{selectedAlert.status}</Badge>} />
              {selectedAlert.assignee && <InfoItem label="Assignee" value={selectedAlert.assignee} />}
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button className="w-full" variant="secondary"><HardHat className="mr-2"/> Assign / Investigate</Button>
                <div className="flex w-full gap-2">
                    <Button className="w-full" variant="outline"><Check className="mr-2"/> Mark as False Positive</Button>
                    <Button className="w-full" variant="destructive"><Shield className="mr-2"/> Escalate</Button>
                </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Select an alert to view details.</div>
        )}
      </Card>
    </div>
  );
}

const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="font-semibold">{value}</div>
    </div>
);
