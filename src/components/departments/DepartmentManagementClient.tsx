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
import type { Branch } from "@/app/(main)/branches/page";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

interface DepartmentManagementClientProps {
  initialDepartments: Department[];
  branches: Branch[];
}

export function DepartmentManagementClient({
  initialDepartments,
  branches
}: DepartmentManagementClientProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isAddDeptOpen, setAddDeptOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "department" } | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const { toast } = useToast();

  const handleAddDepartment = async () => {
    if (!newDeptName || !selectedBranchId) {
        toast({ variant: "destructive", title: "Missing fields", description: "Please provide a department name and select a branch." });
        return;
    }
     const res = await fetch("/api/departments", {
        method: "POST",
        body: JSON.stringify({ name: newDeptName, branchId: selectedBranchId }),
        headers: { "Content-Type": "application/json" },
    });
     if (res.ok) {
        const newDept = await res.json();
        const branchName = branches.find(b => b.id === selectedBranchId)?.name;
        setDepartments(prev => [...prev, { ...newDept, name: newDeptName, branchId: selectedBranchId, branchName, createdAt: new Date().toISOString() }].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Success", description: "New department added." });
        setNewDeptName("");
        setSelectedBranchId("");
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
                <TableHead>Branch</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell><Badge variant="secondary">{dept.branchName}</Badge></TableCell>
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
             <DialogDescription>Enter a name and assign the department to a branch.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
                <Label htmlFor="branch">Branch</Label>
                <Select onValueChange={setSelectedBranchId}>
                    <SelectTrigger id="branch">
                        <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             <div className="grid gap-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input id="dept-name" placeholder="Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
             </div>
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
