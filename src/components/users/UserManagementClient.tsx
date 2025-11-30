
"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { SystemUser } from "@/app/(main)/users/page";
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import type { Role } from "@/app/(main)/roles/page";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

interface UserManagementClientProps {
  initialUsers: SystemUser[];
  branches: Branch[];
  departments: Department[];
  roles: Role[];
}

const userFormSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),
    branch: z.string().optional(),
}).refine(data => {
    if (data.department === 'Branch Operations') {
        return !!data.branch;
    }
    return true;
}, {
    message: "Branch is required for Branch Operations department",
    path: ["branch"],
});


export function UserManagementClient({
  initialUsers,
  branches,
  departments,
  roles,
}: UserManagementClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
        employeeId: "",
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        branch: "",
    },
  });
  
  const departmentWatcher = form.watch("department");

  const handleAddUser = async (values: z.infer<typeof userFormSchema>) => {
    const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    if (res.ok) {
        setUsers(prev => [...prev, result.user].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Success", description: "New user added." });
        form.reset();
        setAddUserOpen(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message || "Failed to add user." });
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/users`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "Success", description: "User deleted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to delete user." });
    }
  };


  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Manage System Users</CardTitle>
          <Button onClick={() => setAddUserOpen(true)}><PlusCircle className="mr-2"/>Add New User</Button>
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
                                {user.name}
                            </div>
                        </TableCell>
                        <TableCell>{user.employeeId}</TableCell>
                         <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.branch || "N/A"}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
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
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New System User</DialogTitle>
            <DialogDescription>Fill in the details to create a new admin user.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="grid gap-4 py-4">
                <FormField control={form.control} name="employeeId" render={({ field }) => (
                    <FormItem><FormLabel>Employee ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                            <SelectContent>{roles.map(role => (<SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                 )} />
                 <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem><FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                            <SelectContent>{departments.map(dept => (<SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                 )} />
                {departmentWatcher === 'Branch Operations' && (
                    <FormField control={form.control} name="branch" render={({ field }) => (
                        <FormItem><FormLabel>Branch</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger></FormControl>
                                <SelectContent>{branches.map(branch => (<SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>))}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                )}
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Create User</Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    