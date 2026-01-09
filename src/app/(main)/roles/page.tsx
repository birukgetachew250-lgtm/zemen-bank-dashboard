
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Edit, PlusCircle, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Role {
    id: number;
    name: string;
    userCount: number;
    description: string;
}


const initialRoles: Role[] = [
  {
    id: 1,
    name: "Super Admin",
    userCount: 2,
    description: "Full access to all system features, including security settings.",
  },
  {
    id: 2,
    name: "Operations Lead",
    userCount: 5,
    description: "Manages day-to-day customer and transaction approvals.",
  },
  {
    id: 3,
    name: "Support Staff",
    userCount: 15,
    description: "Handles customer inquiries and first-level support tickets.",
  },
  {
    id: 4,
    name: "Compliance Officer",
    userCount: 3,
    description: "Audits trails, reviews high-risk transactions, and generates NBE reports.",
  },
  {
    id: 5,
    name: "Read-Only Auditor",
    userCount: 4,
    description: "View-only access to all transactional and user data for auditing purposes.",
  }
];


export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const router = useRouter();
  const { toast } = useToast();
  
  const handleEditRole = (role: Role) => {
    router.push(`/roles/create?roleId=${role.id}`);
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>Define user roles and their access levels across the application.</CardDescription>
          </div>
          <Button onClick={() => router.push('/roles/create')}>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-semibold w-1/4">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground w-1/2">{role.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {role.userCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
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
    </>
  );
}
