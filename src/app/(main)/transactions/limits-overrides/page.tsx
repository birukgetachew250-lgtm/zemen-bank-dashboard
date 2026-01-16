
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
  Check,
  X,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LimitManagementClient } from "@/components/limits/LimitManagementClient";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    Approved: "secondary",
    Pending: "default",
    Rejected: "destructive",
};
const statusColorMap: { [key: string]: string } = {
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
};

const mockOverrides = [
    { id: 'ov-1', timestamp: new Date(), customer: '0911223344 (John Doe)', limit: 'Daily', originalLimit: 50000, requestedAmount: 75000, status: 'Approved', approver: 'Admin User', reason: 'Emergency medical payment' },
    { id: 'ov-2', timestamp: new Date(Date.now() - 1 * 60 * 60000), customer: '0912345678 (Jane Smith)', limit: 'Monthly', originalLimit: 500000, requestedAmount: 600000, status: 'Pending', approver: '', reason: 'School fees payment' },
    { id: 'ov-3', timestamp: new Date(Date.now() - 3 * 60 * 60000), customer: '0922334455 (Sam T.)', limit: 'Daily', originalLimit: 100000, requestedAmount: 120000, status: 'Rejected', approver: 'Admin Lead', reason: 'Insufficient justification' },
];

// This page now acts as a wrapper, so we can't fetch server-side data directly here.
// LimitManagementClient will fetch its own data. For overrides, we continue with mock data for now.
export default function TransactionLimitsPage() {
  
  return (
    <Tabs defaultValue="overrides" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overrides">Limit Overrides</TabsTrigger>
            <TabsTrigger value="config">Limit Configuration</TabsTrigger>
        </TabsList>
        <TabsContent value="overrides" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Transaction Limit Overrides</CardTitle>
                <CardDescription>
                    Review and manage pending requests for transaction limit overrides.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Limit Exceeded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Approver</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockOverrides.map((ov) => (
                            <TableRow key={ov.id}>
                                <TableCell>{format(ov.timestamp, "dd/MM HH:mm")}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{ov.customer.split('(')[1].replace(')', '')}</span>
                                        <span className="text-xs text-muted-foreground">{ov.customer.split('(')[0].trim()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                     <div className="flex flex-col">
                                        <span className="font-medium">ETB {ov.requestedAmount.toLocaleString()}</span>
                                        <span className="text-xs text-muted-foreground">({ov.limit} limit: {ov.originalLimit.toLocaleString()})</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                <Badge
                                    variant={statusVariantMap[ov.status]}
                                    className={cn("items-center gap-1", statusColorMap[ov.status])}
                                >
                                    {ov.status === 'Approved' && <Check className="h-3 w-3" />}
                                    {ov.status === 'Pending' && <Clock className="h-3 w-3" />}
                                    {ov.status === 'Rejected' && <X className="h-3 w-3" />}
                                    {ov.status}
                                </Badge>
                                </TableCell>
                                <TableCell>{ov.reason}</TableCell>
                                <TableCell>{ov.approver || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    {ov.status === 'Pending' ? (
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="secondary">Approve</Button>
                                            <Button size="sm" variant="destructive">Reject</Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="ghost" disabled>Viewed</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="config" className="mt-4">
             <LimitManagementClient initialLimitRules={[]} />
        </TabsContent>
    </Tabs>
  );
}
