
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Transaction {
  id: string;
  corporateName: string;
  date: string;
  amount: number;
  status: "Successful" | "Failed" | "Pending";
  type: "Wire Transfer" | "Payroll" | "Bulk Payment";
}

// Mock data for corporate transactions
const transactions: Transaction[] = [
  { id: 'ctx_1', corporateName: 'Dangote Cement', date: '2023-10-27T10:00:00Z', amount: 1250000, status: 'Successful', type: 'Payroll' },
  { id: 'ctx_2', corporateName: 'MTN Nigeria', date: '2023-10-27T09:30:00Z', amount: 500000, status: 'Successful', type: 'Bulk Payment' },
  { id: 'ctx_3', corporateName: 'Zenith Bank', date: '2023-10-26T15:00:00Z', amount: 75000, status: 'Failed', type: 'Wire Transfer' },
  { id: 'ctx_4', corporateName: 'Jumia Group', date: '2023-10-26T14:00:00Z', amount: 200000, status: 'Successful', type: 'Bulk Payment' },
  { id: 'ctx_5', corporateName: 'Flutterwave', date: '2023-10-25T11:00:00Z', amount: 15000000, status: 'Pending', type: 'Wire Transfer' },
  { id: 'ctx_6', corporateName: 'Dangote Cement', date: '2023-10-25T10:00:00Z', amount: 300000, status: 'Successful', type: 'Wire Transfer' },
  { id: 'ctx_7', corporateName: 'Oando Plc', date: '2023-10-24T18:00:00Z', amount: 800000, status: 'Failed', type: 'Payroll' },
];

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'successful': return 'secondary';
        case 'failed': return 'destructive';
        case 'pending': return 'default';
        default: return 'outline';
    }
}


export default function CorporateTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(
      (transaction) =>
        transaction.corporateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="w-full h-full">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Corporate Transactions</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <Input 
                  placeholder="Search by corporate, type, or ID..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Corporate</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.corporateName}</TableCell>
                    <TableCell>{format(new Date(transaction.date), "dd MMM yyyy, h:mm a")}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>&#8358;{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                          variant={getStatusVariant(transaction.status)}
                          className={cn({
                              'bg-green-100 text-green-800 border-green-200': transaction.status === 'Successful',
                              'bg-red-100 text-red-800 border-red-200': transaction.status === 'Failed',
                              'bg-yellow-100 text-yellow-800 border-yellow-200': transaction.status === 'Pending',
                          })}
                      >
                          {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
