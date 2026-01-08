
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
  CheckCircle2,
  XCircle,
  Clock,
  BarChart,
  GitPullRequest,
  Download
} from "lucide-react";
import { DateRangePicker } from "@/components/transactions/DateRangePicker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    Reconciled: "secondary",
    Pending: "default",
    'Partially Reconciled': "default",
    Failed: "destructive",
};
const statusColorMap: { [key: string]: string } = {
    Reconciled: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Partially Reconciled': 'bg-blue-100 text-blue-800 border-blue-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
};

const mockBatches = [
    { id: 'set-1', date: new Date(Date.now() - 1 * 24 * 60 * 60000), type: 'EthSwitch Interop', status: 'Reconciled', reconciled: 15234, total: 15234, amount: 12540000 },
    { id: 'set-2', date: new Date(Date.now() - 1 * 24 * 60 * 60000), type: 'WorldRemit', status: 'Reconciled', reconciled: 580, total: 580, amount: 8950000 },
    { id: 'set-3', date: new Date(), type: 'EthSwitch Interop', status: 'Partially Reconciled', reconciled: 14890, total: 15102, amount: 11200000 },
    { id: 'set-4', date: new Date(), type: 'CBEBirr', status: 'Pending', reconciled: 0, total: 8945, amount: 6500000 },
];

export default function SettlementsPage() {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settlements & Reconciliation</CardTitle>
          <CardDescription>
            Monitor daily settlement batches and reconciliation status.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Settled (Yesterday)</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ETB 21,490,000</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Discrepancy Amount</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">ETB 12,500</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Batches</CardTitle>
                       <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
            </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <DateRangePicker date={undefined} onDateChange={() => {}}/>
            <Button>Run Manual Reconciliation</Button>
            <Button variant="outline"><Download className="mr-2"/> Export Report</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Batch Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{format(batch.date, "dd MMM yyyy")}</TableCell>
                      <TableCell>{batch.type}</TableCell>
                      <TableCell>
                        <Badge
                            variant={statusVariantMap[batch.status]}
                            className={cn("items-center gap-1", statusColorMap[batch.status])}
                        >
                            {batch.status === 'Reconciled' && <CheckCircle2 className="h-3 w-3" />}
                            {batch.status === 'Pending' && <Clock className="h-3 w-3" />}
                            {batch.status === 'Failed' && <XCircle className="h-3 w-3" />}
                            {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Progress value={(batch.reconciled / batch.total) * 100} className="w-40" />
                           <span className="text-xs text-muted-foreground">
                                {batch.reconciled.toLocaleString()}/{batch.total.toLocaleString()}
                           </span>
                        </div>
                      </TableCell>
                       <TableCell className="font-medium">ETB {batch.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View Details</Button>
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
