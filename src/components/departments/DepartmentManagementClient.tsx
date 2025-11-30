"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Department } from "@/app/(main)/departments/page";
import { format } from "date-fns";

interface DepartmentManagementClientProps {
  initialDepartments: Department[];
}

export function DepartmentManagementClient({
  initialDepartments,
}: DepartmentManagementClientProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isAddDeptOpen, setAddDeptOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "department" } | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const { toast } = useToast();

  const handleAddDepartment = async () => {
    if (!newDeptName) {
        toast({ variant: "destructive", title: "Missing field", description: "Please enter a department name." });
        return;
    }
     const res = await fetch("/api/departments", {
        method: "POST",
        body: JSON.stringify({ name: newDeptName }),
        headers: { "Content-Type": "application/json" },
    });
     if (res.ok) {
        const newDept = await res.json();
        setDepartments(prev => [...prev, { id: newDept.id, name: newDeptName, createdAt: new Date().toISOString() }].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Success", description: "New department added." });
        setNewDeptName("");
        setAddDeptOpen(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to add department." });
    }
  };

  const openDeleteDialog = (id: string, type: "department") => {
    setItemToDelete({ id, type });
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    const res = await fetch(`/api/${type}s`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted.` });
    } else {
      toast({ variant: "destructive", title: "Error", description: `Failed to delete ${type}.` });
    }
    setDeleteAlertOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Manage Departments</CardTitle>
          <Button onClick={() => setAddDeptOpen(true)}><PlusCircle className="mr-2"/>Add New Department</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{format(new Date(dept.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(dept.id, "department")}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Department Dialog */}
       <Dialog open={isAddDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
             <DialogDescription>Enter the name for the new department.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <Input placeholder="Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
          </div>
          <DialogFooter>
             <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAddDepartment}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the {itemToDelete?.type}.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
