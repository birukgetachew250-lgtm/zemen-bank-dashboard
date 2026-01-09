'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, UploadCloud, CheckCircle, Clock } from "lucide-react";
import { DateRangePicker } from '@/components/transactions/DateRangePicker';
import { format } from 'date-fns';

interface NBEReport {
  id: string;
  name: string;
  generationDate: Date;
  status: 'Submitted' | 'Pending Generation' | 'Draft';
  format: 'PDF' | 'XML';
}

const mockReports: NBEReport[] = [
  { id: 'nbe-1', name: 'Daily Transaction Volume Report', generationDate: new Date(Date.now() - 1 * 24 * 60 * 60000), status: 'Submitted', format: 'XML' },
  { id: 'nbe-2', name: 'Monthly Compliance Summary', generationDate: new Date(Date.now() - 2 * 24 * 60 * 60000), status: 'Submitted', format: 'PDF' },
  { id: 'nbe-3', name: 'Interop Settlement Report', generationDate: new Date(), status: 'Draft', format: 'XML' },
];

export default function NbeReportingPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NBE Regulatory Reporting</CardTitle>
          <CardDescription>Generate, validate, and submit required reports to the National Bank of Ethiopia.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Generate New Report</h3>
            <div className="p-4 border rounded-lg space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Template</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select a pre-configured report..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily-tx">Daily Transaction Volume</SelectItem>
                    <SelectItem value="monthly-compliance">Monthly Compliance Summary</SelectItem>
                    <SelectItem value="interop-settlement">Interop Settlement Report</SelectItem>
                    <SelectItem value="str">Suspicious Transaction Report (STR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DateRangePicker date={undefined} onDateChange={() => {}} />
              </div>
              <Button className="w-full">Generate Report</Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Submit Report</h3>
            <div className="p-4 border rounded-lg space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Draft Report to Submit</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select from generated drafts..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nbe-3">Interop Settlement Report - {format(new Date(), 'dd MMM yyyy')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">This will submit the report directly to the NBE portal via the secure API.</p>
              <Button className="w-full" variant="secondary"><UploadCloud className="mr-2"/>Validate &amp; Submit to NBE</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Generation Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{format(report.generationDate, 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'Submitted' ? 'secondary' : 'default'} className={report.status === 'Submitted' ? 'bg-green-100 text-green-800' : ''}>
                        {report.status === 'Submitted' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm"><Download className="mr-2"/>Download ({report.format})</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
