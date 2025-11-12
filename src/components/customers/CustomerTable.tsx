
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
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  status: string;
  registeredAt: string;
}

interface CustomerTableProps {
    title: string;
    customers: Customer[];
}

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'secondary';
        case 'registered':
            return 'default';
        case 'inactive':
            return 'outline';
        case 'failed':
        case 'dormant':
            return 'destructive';
        default:
            return 'default';
    }
}

export function CustomerTable({ title, customers }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );
  }, [searchTerm, customers]);

  return (
    <Card>
        <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{title}</CardTitle>
             <Input 
                placeholder="Search by name or phone..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(customer.status)}
                        className={cn({
                            'bg-green-100 text-green-800 border-green-200': customer.status === 'active',
                            'bg-blue-100 text-blue-800 border-blue-200': customer.status === 'registered',
                        })}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.registeredAt}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
