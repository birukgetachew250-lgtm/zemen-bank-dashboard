
"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash2, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export interface Role {
    id: number;
    name: string;
    description: string;
    userCount?: number;
}


export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/roles');
        if (!response.ok) throw new Error("Failed to fetch roles.");
        const data = await response.json();
        setRoles(data);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRoles();
  }, [toast]);
  
  const handleEditRole = (role: Role) => {
    router.push(`/roles/create?id=${role.id}`);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    const res = await fetch(`/api/roles/${roleToDelete.id}`, {
      method: "DELETE",
    });
    
    if (res.ok) {
      toast({ title: "Success", description: `Role "${roleToDelete.name}" deleted.` });
      fetchRoles();
    } else {
      const error = await res.json();
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete role." });
    }
    setRoleToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
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
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : roles.map((role) => {
                    let parsedDesc = role.description;
                    try {
                        const descObj = JSON.parse(role.description);
                        parsedDesc = descObj.main || role.description;
                    } catch {}
                    return (
                        <TableRow key={role.id}>
                            <TableCell className="font-semibold w-1/4">{role.name}</TableCell>
                            <TableCell className="text-muted-foreground w-1/2">{parsedDesc}</TableCell>
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
                                <Button variant="ghost" size="icon" onClick={() => setRoleToDelete(role)} className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the role <span className="font-semibold">{roleToDelete?.name}</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
