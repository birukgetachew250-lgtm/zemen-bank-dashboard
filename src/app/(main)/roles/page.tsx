
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash2 } from "lucide-react";

export interface Role {
    id: string;
    name: string;
    permissions: string; // This is a JSON string
}


// Mock data for roles and permissions
const roles: {id: number, name: string, permissions: string[]}[] = [
  {
    id: 1,
    name: "Admin",
    permissions: ["manage-users", "manage-roles", "view-reports", "manage-settings", "approve-all"],
  },
  {
    id: 2,
    name: "Support Lead",
    permissions: ["approve-pin-reset", "approve-new-device", "view-customer-audit", "manage-tickets"],
  },
  {
    id: 3,
    name: "Support Staff",
    permissions: ["view-customers", "handle-tickets", "request-pin-reset"],
  },
  {
    id: 4,
    name: "Compliance Officer",
    permissions: ["view-reports", "view-audit-trails", "flag-transaction"],
  },
];

const permissionLabels: { [key: string]: string } = {
    "manage-users": "Manage Users",
    "manage-roles": "Manage Roles",
    "view-reports": "View Reports",
    "manage-settings": "Manage Settings",
    "approve-all": "Approve All Requests",
    "approve-pin-reset": "Approve PIN Reset",
    "approve-new-device": "Approve New Device",
    "view-customer-audit": "View Customer Audit",
    "manage-tickets": "Manage Tickets",
    "view-customers": "View Customers",
    "handle-tickets": "Handle Tickets",
    "request-pin-reset": "Request PIN Reset",
    "view-audit-trails": "View Audit Trails",
    "flag-transaction": "Flag Transaction",
}


export default function RolesAndPermissionsPage() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Roles & Permissions</CardTitle>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Role
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-semibold w-1/4">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="font-normal">
                          {permissionLabels[permission] || permission}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    