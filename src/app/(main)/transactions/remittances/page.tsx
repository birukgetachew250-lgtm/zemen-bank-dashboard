
"use client";

import { useState } from "react";
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
  Search,
  ArrowUp,
  ArrowDown,
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

const partners = ['All', 'Western Union', 'WorldRemit', 'Ria', 'MoneyGram'];
const transactionStatuses = ['All', 'Completed', 'Failed', 'Pending'];
const directions = ['All', 'Inbound', 'Outbound'];

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    Completed: "secondary",
    Pending: "default",
    Failed: "destructive",
};
const statusColorMap: { [key: string]: string } = {
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
};

const mockTransactions = [
    { id: 'rem-1', timestamp: new Date(), direction: 'Inbound', partner: 'WorldRemit', amountOriginal: 500, currency: 'USD', amountETB: 27500, fee: 50, status: 'Completed', from: 'USA', to: '0911223344', rate: 55.00 },
    { id: 'rem-2', timestamp: new Date(Date.now() - 1 * 60 * 60000), direction: 'Inbound', partner: 'Western Union', amountOriginal: 1000, currency: 'EUR', amountETB: 60000, fee: 100, status: 'Completed', from: 'Germany', to: '0922334455', rate: 60.00 },
    { id: 'rem-3', timestamp: new Date(Date.now() - 2 * 60 * 60000), direction: 'Outbound', partner: 'MoneyGram', amountOriginal: 200, currency: 'USD', amountETB: 11000, fee: 200, status: 'Pending', from: '0912345678', to: 'Kenya', rate: 55.00 },
    { id: 'rem-4', timestamp: new Date(Date.now() - 4 * 60 * 60000), direction: 'Inbound', partner: 'Ria', amountOriginal: 300, currency: 'GBP', amountETB: 21000, fee: 40, status: 'Failed', from: 'UK', to: '0933445566', rate: 70.00 },
];

export default function RemittancesPage() {
  const [filters, setFilters] = useState({
    status: "All",
    partner: "All",
    direction: "All",
    dateRange: undefined,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Remittances</CardTitle>
          <CardDescription>
            Monitor inbound and outbound international remittances.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inbound (Today)</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 15,400,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Country (USA)</CardTitle>
                         <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 6,200,000</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Outbound (Today)</CardTitle>
                       <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 850,000</div>
                    </CardContent>
                </Card>
            </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <DateRangePicker
                date={filters.dateRange}
                onDateChange={(date) => setFilters(prev => ({...prev, dateRange: date as any}))}
            />
            <Select value={filters.direction} onValueChange={(value) => setFilters(prev => ({...prev, direction: value}))}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {directions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.partner} onValueChange={(value) => setFilters(prev => ({...prev, partner: value}))}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>From/To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(tx.timestamp, "dd/MM HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant={tx.direction === 'Inbound' ? 'secondary' : 'outline'} className={cn(tx.direction === 'Inbound' ? 'bg-blue-100 text-blue-800' : '')}>
                          {tx.direction === 'Inbound' ? <ArrowDown className="h-3 w-3 mr-1"/> : <ArrowUp className="h-3 w-3 mr-1"/>}
                          {tx.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.partner}</TableCell>
                      <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">ETB {tx.amountETB.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">{tx.amountOriginal.toLocaleString()} {tx.currency} @ {tx.rate.toFixed(2)}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariantMap[tx.status]}
                          className={cn(statusColorMap[tx.status])}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <span>{tx.from}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                            <span>{tx.to}</span>
                        </div>
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
