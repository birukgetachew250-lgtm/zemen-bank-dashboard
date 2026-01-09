
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DateRangePicker } from '@/components/transactions/DateRangePicker';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: 'log1', timestamp: new Date(), user: 'Abebe B.', action: 'UPDATE_RISK', entityType: 'Customer', entityId: '000123', details: 'Risk level changed from Low to Medium.' },
  { id: 'log2', timestamp: new Date(Date.now() - 3600000), user: 'Tirunesh D.', action: 'CREATE_CASE', entityType: 'Dispute', entityId: 'CASE-002', details: 'New dispute case created.' },
  { id: 'log3', timestamp: new Date(Date.now() - 2 * 3600000), user: 'System', action: 'AUTO_FLAG', entityType: 'Transaction', entityId: 'tx_abc123', details: 'Transaction flagged by rule "Rapid Velocity".' },
  { id: 'log4', timestamp: new Date(Date.now() - 5 * 3600000), user: 'Abebe B.', action: 'RESOLVE_ALERT', entityType: 'Alert', entityId: 'alert-4', details: 'Marked as false positive.' },
];

export default function RiskAuditLogPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk & Compliance Audit Log</CardTitle>
        <CardDescription>A tamper-proof log of all actions taken within the risk and compliance modules.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Search by user, action, entity..." className="w-64" />
            <DateRangePicker date={undefined} onDateChange={() => {}} />
            <Button><Search className="mr-2"/>Search</Button>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User / System</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockAuditLogs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>{format(log.timestamp, 'dd MMM, HH:mm:ss')}</TableCell>
                            <TableCell className="font-medium">{log.user}</TableCell>
                            <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                            <TableCell>
                                <div>{log.entityType}</div>
                                <div className="text-xs text-muted-foreground font-mono">{log.entityId}</div>
                            </TableCell>
                            <TableCell>{log.details}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
