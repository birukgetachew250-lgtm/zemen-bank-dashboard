'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Flag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { DateRangePicker } from '@/components/transactions/DateRangePicker';

type FlagType = 'PEP Match' | 'Sanctions Hit' | 'Adverse Media' | 'KYC Expired';
interface FlaggedCustomer {
  id: string;
  cif: string;
  name: string;
  flags: FlagType[];
  risk: 'Low' | 'Medium' | 'High';
  lastScreened: string;
}

const mockFlaggedCustomers: FlaggedCustomer[] = [
  { id: 'cust1', cif: '000123', name: 'John Doe', flags: ['PEP Match'], risk: 'High', lastScreened: '2026-01-15' },
  { id: 'cust2', cif: '000456', name: 'Jane Smith', flags: ['Sanctions Hit'], risk: 'High', lastScreened: '2026-01-14' },
  { id: 'cust3', cif: '000789', name: 'Samson Tsegaye', flags: ['KYC Expired'], risk: 'Medium', lastScreened: '2025-12-20' },
  { id: 'cust4', cif: '000987', name: 'Abebe Bikila', flags: ['Adverse Media'], risk: 'Medium', lastScreened: '2026-01-10' },
];

const riskColors: Record<'Low' | 'Medium' | 'High', string> = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
};

export default function AmlKycPage() {
  return (
    <Tabs defaultValue="dashboard">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="dashboard">Screening Dashboard &amp; Cases</TabsTrigger>
        <TabsTrigger value="reporting">NBE Report Generator</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>AML/KYC Screening Dashboard</CardTitle>
            <CardDescription>Monitor customers with compliance flags and manage investigation cases.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Input placeholder="Search by CIF, Name..." className="w-64" />
              <Select defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by flag..." /></SelectTrigger></Select>
              <Select defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by risk..." /></SelectTrigger></Select>
              <Button><Search className="mr-2" />Search</Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>CIF</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Last Screened</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFlaggedCustomers.map(cust => (
                    <TableRow key={cust.id}>
                      <TableCell className="font-medium">{cust.name}</TableCell>
                      <TableCell className="font-mono">{cust.cif}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cust.flags.map(flag => <Badge key={flag} variant="destructive">{flag}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell><Badge className={cn(riskColors[cust.risk])}>{cust.risk}</Badge></TableCell>
                      <TableCell>{cust.lastScreened}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm">View Case</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="reporting" className="mt-6">
         <Card>
           <CardHeader>
             <CardTitle>NBE Report Generator</CardTitle>
             <CardDescription>Generate and export pre-built Suspicious Transaction Reports (STRs) and other AML summaries.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-medium">Report Template</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select a report..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="str">Suspicious Transaction Report (STR)</SelectItem>
                    <SelectItem value="aml-summary">Monthly AML Summary</SelectItem>
                    <SelectItem value="kyc-status">KYC Status Overview</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Date Range</label>
               <DateRangePicker date={undefined} onDateChange={()=>{}}/>
             </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select defaultValue="pdf">
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF (Signed)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
             </div>
           </CardContent>
           <CardContent className="flex justify-end gap-2">
               <Button variant="secondary">Preview</Button>
               <Button><Download className="mr-2"/> Generate &amp; Export</Button>
           </CardContent>
         </Card>
       </TabsContent>
    </Tabs>
  );
}
