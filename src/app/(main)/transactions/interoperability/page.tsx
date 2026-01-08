
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  ArrowRight,
  BarChart,
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { DateRangePicker } from "@/components/transactions/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const wallets = ['All', 'Telebirr', 'CBE Birr', 'HelloCash', 'Amole'];
const transactionStatuses = ['All', 'Successful', 'Failed', 'Pending'];

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    Successful: "secondary",
    Pending: "default",
    Failed: "destructive",
};
const statusColorMap: { [key: string]: string } = {
    Successful: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
};

const mockTransactions = [
    { id: 'interop-1', timestamp: new Date(), source: 'Telebirr', dest: 'CBE Birr', amount: 1500, fee: 5, status: 'Successful', traceId: 'trace-abc-123', duration: 1200 },
    { id: 'interop-2', timestamp: new Date(Date.now() - 15 * 60000), source: 'HelloCash', dest: 'Telebirr', amount: 500, fee: 2, status: 'Failed', traceId: 'trace-def-456', duration: 3500 },
    { id: 'interop-3', timestamp: new Date(Date.now() - 30 * 60000), source: 'Amole', dest: 'Zemen Bank', amount: 10000, fee: 25, status: 'Successful', traceId: 'trace-ghi-789', duration: 2500 },
    { id: 'interop-4', timestamp: new Date(Date.now() - 45 * 60000), source: 'CBE Birr', dest: 'HelloCash', amount: 200, fee: 1, status: 'Successful', traceId: 'trace-jkl-012', duration: 900 },
];

export default function InteroperabilityTransfersPage() {
  const [filters, setFilters] = useState({
    status: "All",
    source: "All",
    dest: "All",
    dateRange: undefined,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interoperability Transfers</CardTitle>
          <CardDescription>
            Monitor transfers via EIPS/National Switch and cross-wallet systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interop Volume (Today)</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 4,500,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.8%</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Failure Reason</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold">Receiver Not Found</div>
                         <p className="text-xs text-muted-foreground">15 failures today</p>
                    </CardContent>
                </Card>
            </div>


          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <DateRangePicker
                date={filters.dateRange}
                onDateChange={(date) => setFilters(prev => ({...prev, dateRange: date as any}))}
            />
             <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({...prev, source: value}))}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(w => <SelectItem key={`src-${w}`} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.dest} onValueChange={(value) => setFilters(prev => ({...prev, dest: value}))}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(w => <SelectItem key={`dest-${w}`} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                 {transactionStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Switch Trace ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 font-medium">
                                <Image src={`https://picsum.photos/seed/${tx.source}/20/20`} width={20} height={20} alt={tx.source} className="rounded-full" />
                                {tx.source}
                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                <Image src={`https://picsum.photos/seed/${tx.dest}/20/20`} width={20} height={20} alt={tx.dest} className="rounded-full" />
                                {tx.dest}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">{format(tx.timestamp, "dd/MM/yyyy HH:mm:ss")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">ETB {tx.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariantMap[tx.status]}
                          className={cn(statusColorMap[tx.status])}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.duration}ms</TableCell>
                      <TableCell className="font-mono text-xs">{tx.traceId}</TableCell>
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
