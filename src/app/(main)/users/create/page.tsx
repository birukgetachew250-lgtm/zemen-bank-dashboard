
'use client';

import { useState } from "react";
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
import { db } from "@/lib/db";
import { Loader2 } from "lucide-react";

const userFormSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),
    branch: z.string().optional(),
}).refine(data => {
    // This logic needs to match the department name exactly
    if (data.department === 'Branch Operations') {
        return !!data.branch;
    }
    return true;
}, {
    message: "Branch is required for Branch Operations department",
    path: ["branch"],
});

function getFormData() {
    const branches = db.prepare("SELECT * FROM branches ORDER BY name ASC").all() as Branch[];
    const departments = db.prepare("SELECT * FROM departments ORDER BY name ASC").all() as Department[];
    const roles = db.prepare("SELECT * FROM roles ORDER BY name ASC").all() as Role[];
    return { branches, departments, roles };
}

export default function CreateUserPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    // In a real server component this would be props, but for client we fetch it
    const { branches, departments, roles } = getFormData();

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
        setIsLoading(true);
        const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(values),
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
        <div className="w-full h-full">
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
        </div>
    );
}
