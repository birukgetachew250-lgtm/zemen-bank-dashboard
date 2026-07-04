
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
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Users, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { User, Role } from "@prisma/client";
import { cn } from "@/lib/utils";


interface UserManagementClientProps {
  initialUsers: User[];
  roles: Role[];
}

export function UserManagementClient({
  initialUsers,
  roles,
}: UserManagementClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleEditUser = (user: User) => {
    router.push(`/users/create?id=${user.id}`);
  };

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
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to delete user." });
    }
    setUserToDelete(null);
  };

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleToggleLock = async (user: User) => {
    setActionLoading(prev => ({ ...prev, [`lock-${user.id}`]: true }));
    try {
      const action = user.isLocked ? 'unlock' : 'suspend';
      const res = await fetch('/api/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(user.id), action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update user');
      toast({ title: 'Success', description: result.message });
      // Update local state instantly
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isLocked: !user.isLocked } : u));
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setActionLoading(prev => ({ ...prev, [`lock-${user.id}`]: false }));
    }
  };

  const handleResetPassword = async (user: User) => {
    setActionLoading(prev => ({ ...prev, [`reset-${user.id}`]: true }));
    try {
      const res = await fetch('/api/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(user.id), action: 'reset-password' }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to reset password');
      toast({ title: 'Password Reset', description: 'Temporary password generated. Please provide it to the user.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setActionLoading(prev => ({ ...prev, [`reset-${user.id}`]: false }));
    }
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Manage System Users</CardTitle>
            <CardDescription className="mt-1">Create and manage internal bank staff accounts.</CardDescription>
          </div>
          <Button onClick={() => router.push('/users/create')}>
            <PlusCircle className="mr-2 h-4 w-4"/>Add New User
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-2 max-w-sm">
             <input 
               type="text" 
               placeholder="Search by name, email, role..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             />
           </div>
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src="/images/avatar.png" alt={user.name} />
                                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
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
                            <div className="flex gap-2 justify-end items-center">
                                <span className={cn('text-xs px-2 py-1 rounded', user.isLocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700')}>{user.isLocked ? 'Locked' : 'Active'}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleLock(user)} disabled={actionLoading[`lock-${user.id}`]}>
                                  {actionLoading[`lock-${user.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : (user.isLocked ? 'Unlock' : 'Lock')}
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => handleResetPassword(user)} disabled={actionLoading[`reset-${user.id}`]}>
                                  {actionLoading[`reset-${user.id}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
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
