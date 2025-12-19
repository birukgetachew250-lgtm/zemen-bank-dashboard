

'use client';

import { useState, useMemo } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import type { Role } from "@/app/(main)/roles/page";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const userFormSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string().min(1, "Role is required"),
    branch: z.string().min(1, "Branch is required"),
    department: z.string().min(1, "Department is required"),
});


interface CreateUserFormProps {
    branches: Branch[];
    departments: Department[];
    roles: Role[];
}

export function CreateUserForm({ branches, departments, roles }: CreateUserFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof userFormSchema>>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            employeeId: "",
            name: "",
            email: "",
            password: "",
            role: "",
            branch: "",
            department: "",
        },
    });

    const branchWatcher = form.watch("branch");

    const filteredDepartments = useMemo(() => {
        if (!branchWatcher) return [];
        const selectedBranchName = branches.find(b => b.id === branchWatcher)?.name;
        if (!selectedBranchName) return [];
        return departments.filter(d => d.branchName === selectedBranchName);
    }, [branchWatcher, departments, branches]);
    

    const handleAddUser = async (values: z.infer<typeof userFormSchema>) => {
        setIsLoading(true);

        const branchName = branches.find(b => b.id === values.branch)?.name;
        const departmentName = departments.find(d => d.id === values.department)?.name;

        const submissionData = {
            ...values,
            branch: branchName,
            department: departmentName
        };

        const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(submissionData),
            headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        if (res.ok) {
            toast({ title: "Success", description: "New user created successfully." });
            router.push('/users');
            router.refresh();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message || "Failed to add user." });
        }
        setIsLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Add New System User</CardTitle>
                        <CardDescription>Fill in the details to create a new admin user.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="employeeId" render={({ field }) => (
                            <FormItem><FormLabel>Employee ID</FormLabel><FormControl><Input placeholder="e.g. 12345" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="e.g. john.doe@zemenbank.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                    <SelectContent>{roles.map(role => (<SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>))}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <div />
                         <FormField control={form.control} name="branch" render={({ field }) => (
                            <FormItem><FormLabel>Branch</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('department', '');
                                }} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger></FormControl>
                                    <SelectContent>{branches.map(branch => (<SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>))}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!branchWatcher}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={branchWatcher ? "Select a department" : "Select a branch first"} /></SelectTrigger></FormControl>
                                    <SelectContent>{filteredDepartments.map(dept => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
