'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Download, RotateCw, CheckCircle, XCircle } from "lucide-react";
import { DateRangePicker } from '@/components/transactions/DateRangePicker';
import { format } from 'date-fns';

interface ExportRequest {
  id: string;
  status: 'Ready' | 'Processing' | 'Pending' | 'Failed';
  type: string;
  dateRange: string;
  format: 'CSV' | 'PDF' | 'Excel';
  requestedBy: string;
  requestedAt: Date;
  progress?: number;
}

const mockExports: ExportRequest[] = [
  { id: 'ex1', status: 'Ready', type: 'Transactions', dateRange: 'Last 30 Days', format: 'CSV', requestedBy: 'Admin', requestedAt: new Date(Date.now() - 30 * 60 * 1000) },
  { id: 'ex2', status: 'Processing', type: 'User Master', dateRange: 'All Time', format: 'Excel', requestedBy: 'Admin', requestedAt: new Date(Date.now() - 5 * 60 * 1000), progress: 75 },
  { id: 'ex3', status: 'Failed', type: 'Financial Inclusion', dateRange: 'Last 90 Days', format: 'PDF', requestedBy: 'Compliance', requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 'ex4', status: 'Pending', type: 'Transactions', dateRange: 'Yesterday', format: 'CSV', requestedBy: 'Support', requestedAt: new Date(Date.now() - 1 * 60 * 1000) },
];

const statusConfig = {
    Ready: { Icon: CheckCircle, color: 'text-green-500' },
    Processing: { Icon: RotateCw, color: 'text-blue-500 animate-spin' },
    Pending: { Icon: RotateCw, color: 'text-yellow-500' },
    Failed: { Icon: XCircle, color: 'text-red-500' },
};

export default function ExportCenterPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Export Center</CardTitle>
              <CardDescription>On-demand and historical data exports.</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2" />New Export</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExports.map((ex) => {
                    const { Icon, color } = statusConfig[ex.status];
                    return (
                        <TableRow key={ex.id}>
                            <TableCell>{format(ex.requestedAt, 'dd MMM, HH:mm')}</TableCell>
                            <TableCell className="font-medium">{ex.type}</TableCell>
                            <TableCell>{ex.dateRange}</TableCell>
                            <TableCell><Badge variant="outline">{ex.format}</Badge></TableCell>
                            <TableCell>{ex.requestedBy}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${color}`} />
                                    <span>{ex.status}</span>
                                    {ex.status === 'Processing' && <Progress value={ex.progress} className="w-24 h-2" />}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {ex.status === 'Ready' && <Button size="sm"><Download className="mr-2" />Download</Button>}
                                {ex.status === 'Failed' && <Button size="sm" variant="secondary">Retry</Button>}
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Export</DialogTitle>
                <DialogDescription>Select data source, filters, and format for your export.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Select><SelectTrigger><SelectValue placeholder="Select data source..." /></SelectTrigger>
                    <SelectContent><SelectItem value="tx">Transactions</SelectItem><SelectItem value="users">User Master</SelectItem></SelectContent>
                </Select>
                <DateRangePicker date={undefined} onDateChange={() => {}} />
                <Select><SelectTrigger><SelectValue placeholder="Select format..." /></SelectTrigger>
                    <SelectContent><SelectItem value="csv">CSV</SelectItem><SelectItem value="excel">Excel</SelectItem><SelectItem value="pdf">PDF</SelectItem></SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button>Request Export</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
