

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
  ArrowUpDown,
  Search,
  Users,
  CheckCircle2
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

const transactionTypes = ['All', 'P2P Send', 'P2P Receive', 'Wallet Top-up', 'Withdrawal', 'Airtime'];
const transactionStatuses = ['All', 'Successful', 'Failed', 'Pending', 'Reversed'];
const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Successful: "secondary",
    Pending: "default",
    Failed: "destructive",
    Reversed: "outline",
};
const statusColorMap: { [key: string]: string } = {
    Successful: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
    Reversed: 'bg-gray-100 text-gray-800 border-gray-200',
};


const mockTransactions = [
    { id: 'p2p-1', timestamp: new Date(), type: 'P2P Send', amount: 500, fee: 2, status: 'Successful', sender: '0911223344', receiver: '0922334455', channel: 'App'},
    { id: 'p2p-2', timestamp: new Date(Date.now() - 5 * 60000), type: 'Airtime', amount: 100, fee: 0, status: 'Successful', sender: '0912345678', receiver: 'Ethio Telecom', channel: 'USSD'},
    { id: 'p2p-3', timestamp: new Date(Date.now() - 10 * 60000), type: 'Withdrawal', amount: 2000, fee: 15, status: 'Pending', sender: '0911111111', receiver: 'Agent 007', channel: 'Agent'},
    { id: 'p2p-4', timestamp: new Date(Date.now() - 15 * 60000), type: 'P2P Send', amount: 1500, fee: 5, status: 'Failed', sender: '0933445566', receiver: '0944556677', channel: 'App'},
    { id: 'p2p-5', timestamp: new Date(Date.now() - 20 * 60000), type: 'Wallet Top-up', amount: 1000, fee: 0, status: 'Successful', sender: 'CBE-100012345', receiver: '0911223344', channel: 'App'},
];

export default function P2PWalletTransfersPage() {
  const [filters, setFilters] = useState({
    query: "",
    status: "All",
    type: "All",
    dateRange: undefined,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>P2P & Wallet Transfers</CardTitle>
          <CardDescription>
            Monitor peer-to-peer, agent, and wallet funding/withdrawal transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">P2P Volume (Today)</CardTitle>
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 1,250,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.2%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Users by Volume</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">List of top users</div>
                    </CardContent>
                </Card>
            </div>


          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by Txn ID, Phone, Account..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({...prev, query: e.target.value}))}
              />
            </div>
            <DateRangePicker
                date={filters.dateRange}
                onDateChange={(date) => setFilters(prev => ({...prev, dateRange: date as any}))}
            />
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({...prev, type: value}))}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Channel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                      <TableCell>{format(tx.timestamp, "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type}</Badge>
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
                      <TableCell>{tx.sender}</TableCell>
                      <TableCell>{tx.receiver}</TableCell>
                      <TableCell>{tx.channel}</TableCell>
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
