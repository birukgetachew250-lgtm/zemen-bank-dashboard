
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription className="mt-1">Define user roles and their access levels across the application.</CardDescription>
          </div>
          <Button onClick={() => router.push('/roles/create')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Role
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 max-w-sm">
             <input 
               type="text" 
               placeholder="Search by role name or description..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             />
           </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Users</TableHead>
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
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : filteredRoles.map((role) => {
                    let parsedDesc = role.description;
                    try {
                        const descObj = JSON.parse(role.description);
                        parsedDesc = descObj.main || role.description;
                    } catch {}
                    return (
                      <TableRow key={role.id}>
                        <TableCell className="font-semibold w-1/4">{role.name}</TableCell>
                        <TableCell className="text-muted-foreground w-1/2">{parsedDesc}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.userCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                           <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                              <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => setRoleToDelete(role)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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
