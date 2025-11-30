
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { SystemUser } from "@/app/(main)/users/page";
import type { Role } from "@/app/(main)/roles/page";
import Image from "next/image";
import { Badge } from "../ui/badge";
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

interface UserManagementClientProps {
  initialUsers: SystemUser[];
  roles: Role[];
}

export function UserManagementClient({
  initialUsers,
  roles,
}: UserManagementClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const res = await fetch(`/api/users`, {
      method: "DELETE",
      body: JSON.stringify({ id: userToDelete.id }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast({ title: "Success", description: "User deleted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to delete user." });
    }
    setUserToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Manage System Users</CardTitle>
          <Button onClick={() => router.push('/users/create')}>
            <PlusCircle className="mr-2"/>Add New User
          </Button>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <Image 
                                    src={user.avatar_url || `https://picsum.photos/seed/${user.id}/40/40`} 
                                    alt={`${user.name} avatar`}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <div className="flex flex-col">
                                  <span>{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{user.employeeId}</TableCell>
                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.branch || "N/A"}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the user <span className="font-semibold">{userToDelete?.name}</span>.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
