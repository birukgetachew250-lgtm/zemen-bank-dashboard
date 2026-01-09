'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, User, MessageSquare, Clock, Paperclip } from "lucide-react";
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

type DisputeStatus = 'New' | 'In Progress' | 'Awaiting Customer' | 'Resolved' | 'Closed';
type DisputeType = 'Unauthorized Tx' | 'Failed Payment' | 'Fee Complaint' | 'Other';

interface DisputeCase {
  id: string;
  customer: string;
  cif: string;
  type: DisputeType;
  status: DisputeStatus;
  openedAt: Date;
  slaTimer: string;
  assignee?: string;
  details: string;
}

const mockDisputes: DisputeCase[] = [
  { id: 'CASE-001', customer: 'John Doe', cif: '000123', type: 'Unauthorized Tx', status: 'New', openedAt: new Date(Date.now() - 3600000), slaTimer: '23h remaining', details: 'A transaction of 5000 ETB was made from my account that I did not authorize.' },
  { id: 'CASE-002', customer: 'Jane Smith', cif: '000456', type: 'Failed Payment', status: 'In Progress', openedAt: new Date(Date.now() - 2 * 24 * 3600000), slaTimer: '48h remaining', assignee: 'Abebe B.', details: 'Tried to pay my electricity bill but it failed and the money was deducted.' },
  { id: 'CASE-003', customer: 'Samson Tsegaye', cif: '000789', type: 'Fee Complaint', status: 'Awaiting Customer', openedAt: new Date(Date.now() - 5 * 24 * 3600000), slaTimer: 'SLA Paused', assignee: 'Tirunesh D.', details: 'I was charged an incorrect fee for an international remittance.' },
  { id: 'CASE-004', customer: 'Sara Connor', cif: '0061234', type: 'Unauthorized Tx', status: 'Resolved', openedAt: new Date(Date.now() - 10 * 24 * 3600000), slaTimer: 'SLA Met', assignee: 'Abebe B.', details: 'Initial report of unauthorized transaction was found to be a misunderstanding. Customer confirmed the payment.' },
];

const statusColors: Record<DisputeStatus, string> = {
  New: 'border-blue-500 text-blue-500',
  'In Progress': 'border-yellow-500 text-yellow-500',
  'Awaiting Customer': 'border-purple-500 text-purple-500',
  Resolved: 'border-green-500 text-green-500',
  Closed: 'border-gray-500 text-gray-500',
};

export default function DisputeResolutionPage() {
  const [selectedCase, setSelectedCase] = useState<DisputeCase | null>(mockDisputes[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Dispute Resolution Queue</CardTitle>
              <CardDescription>Manage customer transaction disputes and chargebacks.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search Case ID, CIF..." className="w-64"/>
              <Button variant="outline" size="icon"><SlidersHorizontal /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="rounded-md border h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDisputes.map(c => (
                  <TableRow key={c.id} onClick={() => setSelectedCase(c)} className={cn("cursor-pointer", selectedCase?.id === c.id && "bg-muted/50")}>
                    <TableCell className="font-mono">{c.id}</TableCell>
                    <TableCell>
                      <div>{c.customer}</div>
                      <div className="text-xs text-muted-foreground">{c.cif}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={cn(statusColors[c.status])}>{c.status}</Badge></TableCell>
                    <TableCell>{formatDistanceToNowStrict(c.openedAt)}</TableCell>
                    <TableCell>{c.slaTimer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1 flex flex-col">
        {selectedCase ? (
          <>
            <CardHeader>
              <CardTitle>Case Details: {selectedCase.id}</CardTitle>
              <CardDescription>Opened {format(selectedCase.openedAt, 'dd MMM yyyy, HH:mm')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto">
              <InfoItem icon={<User/>} label="Customer" value={selectedCase.customer} />
              <InfoItem icon={<MessageSquare/>} label="Issue" value={selectedCase.details} />
              <InfoItem icon={<Clock/>} label="SLA Status" value={selectedCase.slaTimer} />
              {selectedCase.assignee && <InfoItem icon={<User/>} label="Assignee" value={selectedCase.assignee} />}
               <div>
                  <h4 className="text-sm font-semibold mb-2">Case History &amp; Notes</h4>
                  <div className="p-2 border rounded-md bg-muted/50 text-sm space-y-2">
                      <p><span className="font-semibold">System:</span> Case created.</p>
                      <p><span className="font-semibold">Abebe B.:</span> Assigned to self. Contacted customer for more details.</p>
                  </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t pt-4">
              <Textarea placeholder="Add a note or update..." />
              <div className="flex w-full justify-between items-center">
                <Button size="sm" variant="ghost"><Paperclip className="mr-2"/>Attach File</Button>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline">Update</Button>
                    <Button size="sm">Resolve</Button>
                </div>
              </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Select a case to view details.</div>
        )}
      </Card>
    </div>
  );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="font-medium text-sm">{value}</div>
        </div>
    </div>
);
