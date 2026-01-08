
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  CircleDollarSign,
  Download,
  FileWarning,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/transactions/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";

interface AllTransactionsClientProps {
  initialTransactions: Transaction[];
}

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

const transactionTypes = ['All', 'P2P', 'Bill Payment', 'Airtime', 'Merchant Payment', 'Remittance'];
const transactionStatuses = ['All', 'Successful', 'Failed', 'Pending', 'Reversed'];

export function AllTransactionsClient({ initialTransactions }: AllTransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [summary, setSummary] = useState({ totalVolume: 0, totalTransactions: 0, failedTransactions: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    status: "All",
    type: "All",
    dateRange: undefined as DateRange | undefined,
  });

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.status !== 'All') params.append('status', filters.status);
    if (filters.type !== 'All') params.append('type', filters.type);
    if (filters.dateRange?.from) params.append('from', filters.dateRange.from.toISOString());
    if (filters.dateRange?.to) params.append('to', filters.dateRange.to.toISOString());

    try {
      const response = await fetch(`/api/transactions?${params.toString()}`);
      const data = await response.json();
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const successRate = summary.totalTransactions > 0 ? ((summary.totalTransactions - summary.failedTransactions) / summary.totalTransactions) * 100 : 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Search, filter, and manage all transactions across the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volume (Today)</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB {summary.totalVolume.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate.toFixed(2)}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalTransactions.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.failedTransactions.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>


          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by Txn ID, Phone, Account..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({...prev, query: e.target.value}))}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
              />
            </div>
            <DateRangePicker
                date={filters.dateRange}
                onDateChange={(date) => setFilters(prev => ({...prev, dateRange: date}))}
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
            <Button onClick={fetchTransactions} disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
              Filter
            </Button>
             <Button variant="outline" className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
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
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Channel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={8} className="py-2"><div className="animate-pulse bg-muted h-6 rounded-md"></div></TableCell>
                        </TableRow>
                    ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.id.split('-')[0]}</TableCell>
                      <TableCell>{format(new Date(tx.timestamp), "dd/MM/yyyy HH:mm")}</TableCell>
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
                      <TableCell>
                        <div className="flex flex-col">
                            <span>{tx.from.name}</span>
                            <span className="text-xs text-muted-foreground">{tx.from.account}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span>{tx.to.name}</span>
                            <span className="text-xs text-muted-foreground">{tx.to.account}</span>
                        </div>
                      </TableCell>
                      <TableCell>{tx.channel}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination would go here */}
        </CardContent>
      </Card>
    </div>
  );
}

