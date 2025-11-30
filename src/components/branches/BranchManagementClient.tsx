
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, MapPin, Building } from "lucide-react";
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
import type { Branch, Department } from "@/app/(main)/branches/page";
import { format } from "date-fns";

interface BranchManagementClientProps {
  initialBranches: Branch[];
  initialDepartments: Department[];
}

export function BranchManagementClient({
  initialBranches,
  initialDepartments,
}: BranchManagementClientProps) {
  const [branches, setBranches] = useState(initialBranches);
  const [departments, setDepartments] = useState(initialDepartments);
  const [isAddBranchOpen, setAddBranchOpen] = useState(false);
  const [isAddDeptOpen, setAddDeptOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "branch" | "department" } | null>(null);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocation, setNewBranchLocation] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const { toast } = useToast();

  const handleAddBranch = async () => {
    if (!newBranchName || !newBranchLocation) {
        toast({ variant: "destructive", title: "Missing fields", description: "Please enter both branch name and location."});
        return;
    }
    const res = await fetch("/api/branches", {
        method: "POST",
        body: JSON.stringify({ name: newBranchName, location: newBranchLocation }),
        headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
        const newBranch = await res.json();
        setBranches(prev => [...prev, { id: newBranch.id, name: newBranchName, location: newBranchLocation, createdAt: new Date().toISOString() }].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Success", description: "New branch added." });
        setNewBranchName("");
        setNewBranchLocation("");
        setAddBranchOpen(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to add branch." });
    }
  };

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

  const openDeleteDialog = (id: string, type: "branch" | "department") => {
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
      if (type === "branch") {
        setBranches((prev) => prev.filter((b) => b.id !== id));
      } else {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
      }
      toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted.` });
    } else {
      toast({ variant: "destructive", title: "Error", description: `Failed to delete ${type}.` });
    }
    setDeleteAlertOpen(false);
    setItemToDelete(null);
  };


  return (
    <>
      <Tabs defaultValue="branches" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branches"><MapPin className="mr-2"/>Branches</TabsTrigger>
          <TabsTrigger value="departments"><Building className="mr-2"/>Departments</TabsTrigger>
        </TabsList>
        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Manage Branches</CardTitle>
              <Button onClick={() => setAddBranchOpen(true)}><PlusCircle className="mr-2"/>Add New Branch</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.location}</TableCell>
                      <TableCell>{format(new Date(branch.createdAt), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(branch.id, "branch")}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="departments">
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
        </TabsContent>
      </Tabs>
      {/* Add Branch Dialog */}
      <Dialog open={isAddBranchOpen} onOpenChange={setAddBranchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>Enter the details for the new bank branch.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <Input placeholder="Branch Name" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} />
             <Input placeholder="Branch Location (e.g., Bole, Addis Ababa)" value={newBranchLocation} onChange={(e) => setNewBranchLocation(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAddBranch}>Add Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
