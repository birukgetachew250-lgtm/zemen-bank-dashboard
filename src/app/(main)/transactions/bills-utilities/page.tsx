
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Search,
  Zap,
  Droplets,
  Phone,
  BarChart
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

const providers = ['All', 'EEPCO', 'Water', 'Ethio Telecom', 'DSTV'];
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
    { id: 'bill-1', timestamp: new Date(), provider: 'EEPCO', amount: 850, fee: 10, status: 'Successful', phone: '0911223344', reference: '987654321' },
    { id: 'bill-2', timestamp: new Date(Date.now() - 5 * 60000), provider: 'Ethio Telecom', amount: 250, fee: 1, status: 'Successful', phone: '0912345678', reference: 'Airtime' },
    { id: 'bill-3', timestamp: new Date(Date.now() - 10 * 60000), provider: 'Water', amount: 400, fee: 5, status: 'Failed', phone: '0911111111', reference: '123456789' },
    { id: 'bill-4', timestamp: new Date(Date.now() - 15 * 60000), provider: 'DSTV', amount: 1200, fee: 12, status: 'Successful', phone: '0933445566', reference: '55667788' },
];

export default function BillPaymentsPage() {
  const [filters, setFilters] = useState({
    query: "",
    status: "All",
    provider: "All",
    dateRange: undefined,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill Payments & Utilities</CardTitle>
          <CardDescription>
            Monitor all bill and utility payments made through the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bill Volume (Today)</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 2,300,000</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Provider (Electricity)</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 1,500,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Water</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 450,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Telecom</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 350,000</div>
                    </CardContent>
                </Card>
            </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by Ref #, Phone..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({...prev, query: e.target.value}))}
              />
            </div>
            <DateRangePicker
                date={filters.dateRange}
                onDateChange={(date) => setFilters(prev => ({...prev, dateRange: date as any}))}
            />
            <Select value={filters.provider} onValueChange={(value) => setFilters(prev => ({...prev, provider: value}))}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
              <SelectTrigger className="w-full md:w-[180px]">
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
                  <TableHead>Tx ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                      <TableCell>{format(tx.timestamp, "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.provider}</Badge>
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
                      <TableCell>{tx.phone}</TableCell>
                      <TableCell className="font-mono">{tx.reference}</TableCell>
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
