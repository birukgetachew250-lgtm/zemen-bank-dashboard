
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const roles = ["Super Admin", "Operations Lead", "Compliance Officer", "Support Staff", "Read-Only Auditor"];

const resources = [
  "Customers", "Transactions", "Approvals", "Risk & Compliance", "System Monitoring", "Security & Access", "Settings"
];

// Mock permission data: true = allowed, false = denied
const permissions: Record<string, Record<string, boolean>> = {
  "Super Admin": { Customers: true, Transactions: true, Approvals: true, "Risk & Compliance": true, "System Monitoring": true, "Security & Access": true, Settings: true },
  "Operations Lead": { Customers: true, Transactions: true, Approvals: true, "Risk & Compliance": false, "System Monitoring": false, "Security & Access": false, Settings: false },
  "Compliance Officer": { Customers: true, Transactions: true, Approvals: false, "Risk & Compliance": true, "System Monitoring": false, "Security & Access": false, Settings: false },
  "Support Staff": { Customers: true, Transactions: false, Approvals: false, "Risk & Compliance": false, "System Monitoring": false, "Security & Access": false, Settings: false },
  "Read-Only Auditor": { Customers: true, Transactions: true, Approvals: true, "Risk & Compliance": true, "System Monitoring": true, "Security & Access": false, Settings: false },
};

// Simplified view for the matrix
const simplifiedPermissions = {
  "Super Admin": { ...permissions["Super Admin"] },
  "Operations Lead": { ...permissions["Operations Lead"] },
  "Compliance Officer": { ...permissions["Compliance Officer"] },
  "Support Staff": { ...permissions["Support Staff"] },
  "Read-Only Auditor": { Customers: true, Transactions: true, Approvals: true, "Risk & Compliance": true, "System Monitoring": true, "Security & Access": false, Settings: false },
};

export default function PermissionMatrixPage() {
    const [role1, setRole1] = useState("Operations Lead");
    const [role2, setRole2] = useState("Compliance Officer");
    const [compareMode, setCompareMode] = useState(false);
    
    const rolesToDisplay = compareMode ? [role1, role2] : roles;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Permissions Matrix</CardTitle>
                <CardDescription>A detailed grid of all roles and their high-level resource permissions.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                 <Button variant={compareMode ? "secondary" : "outline"} onClick={() => setCompareMode(!compareMode)}>
                    {compareMode ? "Exit Compare Mode" : "Compare Roles"}
                </Button>
                {compareMode && (
                    <>
                        <Select value={role1} onValueChange={setRole1}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{roles.map(r => <SelectItem key={`r1-${r}`} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                         <span className="text-muted-foreground">vs.</span>
                        <Select value={role2} onValueChange={setRole2}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{roles.map(r => <SelectItem key={`r2-${r}`} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                    </>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Resource</TableHead>
                {rolesToDisplay.map(role => (
                    <TableHead key={role} className="text-center">{role}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
                {resources.map(resource => (
                    <TableRow key={resource}>
                        <TableCell className="font-medium">{resource}</TableCell>
                        {rolesToDisplay.map(role => {
                            const hasAccess = simplifiedPermissions[role]?.[resource];
                            const isDiff = compareMode && simplifiedPermissions[role1]?.[resource] !== simplifiedPermissions[role2]?.[resource];
                            return (
                                <TableCell key={`${role}-${resource}`} className={cn("text-center", isDiff && "bg-yellow-100/50 dark:bg-yellow-900/20")}>
                                    {hasAccess ? 
                                        <Check className="h-5 w-5 text-green-500 mx-auto" /> : 
                                        <X className="h-5 w-5 text-red-500 mx-auto" />
                                    }
                                </TableCell>
                            )
                        })}
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
