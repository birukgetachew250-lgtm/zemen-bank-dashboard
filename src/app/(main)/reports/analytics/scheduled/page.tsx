'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { format } from 'date-fns';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string;
  lastSent: Date;
  status: 'Active' | 'Paused';
}

const mockReports: ScheduledReport[] = [
  { id: 'sr1', name: 'Daily Transaction Summary', frequency: 'Daily', recipients: 'execs@zemenbank.com', lastSent: new Date(), status: 'Active' },
  { id: 'sr2', name: 'Weekly Inclusion Report', frequency: 'Weekly', recipients: 'compliance@zemenbank.com', lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'Active' },
  { id: 'sr3', name: 'Monthly Fraud Analysis', frequency: 'Monthly', recipients: 'risk@zemenbank.com', lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'Paused' },
];

export default function ScheduledReportsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);

  const openDialog = (report?: ScheduledReport) => {
    setEditingReport(report || null);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage automated reports sent to stakeholders.</CardDescription>
            </div>
            <Button onClick={() => openDialog()}><PlusCircle className="mr-2" />Create Schedule</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell><Badge variant="outline">{report.frequency}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{report.recipients}</TableCell>
                    <TableCell>{format(report.lastSent, 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell>
                        <Badge variant={report.status === 'Active' ? 'secondary' : 'default'} className={report.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                            {report.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(report)}><Edit /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingReport ? 'Edit' : 'Create'} Scheduled Report</DialogTitle>
                <DialogDescription>Configure the report to be sent automatically.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" defaultValue={editingReport?.name} className="col-span-3" placeholder="e.g., Daily Summary"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="frequency" className="text-right">Frequency</Label>
                    <Select defaultValue={editingReport?.frequency}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select frequency"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recipients" className="text-right">Recipients</Label>
                    <Input id="recipients" defaultValue={editingReport?.recipients} className="col-span-3" placeholder="Emails, comma-separated"/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="format" className="text-right">Format</Label>
                    <Select defaultValue="PDF">
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select format"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="CSV">CSV</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button>Save Schedule</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
