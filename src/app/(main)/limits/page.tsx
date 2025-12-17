
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, PlusCircle } from "lucide-react";

const limitRules = [
  { id: 'lim1', category: 'Retail', transactionType: 'Fund Transfer', dailyLimit: 100000, monthlyLimit: 1000000 },
  { id: 'lim2', category: 'Retail', transactionType: 'Bill Payment', dailyLimit: 50000, monthlyLimit: 500000 },
  { id: 'lim3', category: 'Retail', transactionType: 'Airtime/Data', dailyLimit: 10000, monthlyLimit: 100000 },
  { id: 'lim4', category: 'Premium', transactionType: 'Fund Transfer', dailyLimit: 500000, monthlyLimit: 5000000 },
  { id: 'lim5', category: 'Premium', transactionType: 'Bill Payment', dailyLimit: 200000, monthlyLimit: 2000000 },
  { id: 'lim6', category: 'Corporate', transactionType: 'Bulk Payment', dailyLimit: 10000000, monthlyLimit: 250000000 },
  { id: 'lim7', category: 'Corporate', transactionType: 'Fund Transfer', dailyLimit: 5000000, monthlyLimit: 100000000 },
];

const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function LimitsPage() {
  return (
    <div className="w-full h-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Limits</CardTitle>
            <CardDescription>Manage daily and monthly transaction limits for different customer categories.</CardDescription>
          </div>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Limit Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Category</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Daily Limit</TableHead>
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {limitRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant={rule.category === 'Retail' ? 'secondary' : rule.category === 'Premium' ? 'default' : 'outline'}>
                        {rule.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.transactionType}</TableCell>
                    <TableCell>{formatCurrency(rule.dailyLimit)}</TableCell>
                    <TableCell>{formatCurrency(rule.monthlyLimit)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
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
