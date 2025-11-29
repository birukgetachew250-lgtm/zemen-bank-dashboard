
'use client';
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const appUsers = [
  {
    Id: "user_1",
    CIFNumber: "1002345",
    FirstName: "John",
    LastName: "Doe",
    Email: "john.doe@example.com",
    PhoneNumber: "+2348012345678",
    Status: "Active",
    LinkedAccounts: [
      { AccountNumber: "0012345678", AccountType: "Savings", Status: "Active" },
      { AccountNumber: "0087654321", AccountType: "Current", Status: "Active" },
    ],
  },
  {
    Id: "user_2",
    CIFNumber: "1002346",
    FirstName: "Jane",
    LastName: "Smith",
    Email: "jane.smith@example.com",
    PhoneNumber: "+2348023456789",
    Status: "Inactive",
    LinkedAccounts: [
      { AccountNumber: "0023456789", AccountType: "Savings", Status: "Dormant" },
    ],
  },
    {
    Id: "user_3",
    CIFNumber: "1002347",
    FirstName: "David",
    LastName: "Bello",
    Email: "david.bello@example.com",
    PhoneNumber: "+2348034567890",
    Status: "Active",
    LinkedAccounts: [
      { AccountNumber: "0034567890", AccountType: "Current", Status: "Active" },
    ],
  },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "dormant":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-red-100 text-red-800 border-red-200";
  }
};


export default function AppUsersAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return appUsers;
    return appUsers.filter(
      (user) =>
        user.CIFNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.PhoneNumber.includes(searchTerm)
    );
  }, [searchTerm]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>App Users & Linked Accounts</CardTitle>
                <CardDescription>Search and view mobile app users and their bank accounts.</CardDescription>
            </div>
            <Input
                placeholder="Search by CIF, name, email, or phone..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CIF Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>User Status</TableHead>
                <TableHead>Linked Accounts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.Id}>
                    <TableCell className="font-mono">{user.CIFNumber}</TableCell>
                    <TableCell className="font-medium">{`${user.FirstName} ${user.LastName}`}</TableCell>
                    <TableCell>
                      <div className="text-sm">{user.Email}</div>
                      <div className="text-xs text-muted-foreground">{user.PhoneNumber}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getStatusBadgeVariant(user.Status))}>
                        {user.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {user.LinkedAccounts.map((acc) => (
                          <div key={acc.AccountNumber} className="flex items-center gap-2">
                            <span className="font-mono text-sm">{acc.AccountNumber}</span>
                            <Badge variant="outline" className="text-xs">{acc.AccountType}</Badge>
                            <Badge className={cn("capitalize text-xs", getStatusBadgeVariant(acc.Status))}>
                                {acc.Status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
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
