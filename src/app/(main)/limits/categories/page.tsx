
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

interface ListItem {
    id: string;
    name: string;
}

const initialItems: ListItem[] = [
    { id: "cat-1", name: "Retail" },
    { id: "cat-2", name: "Premium" },
    { id: "cat-3", name: "Corporate" },
];

export default function CustomerCategoriesPage() {
    const [items, setItems] = useState<ListItem[]>(initialItems);
    const [isAddOpen, setAddOpen] = useState(false);
    const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ListItem | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const { toast } = useToast();

    const handleAddItem = () => {
        if (!newItemName) {
            toast({ variant: "destructive", title: "Missing fields", description: "Please enter a name."});
            return;
        }
        const newItem = { id: `cat-${Date.now()}`, name: newItemName };
        setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Success", description: "New customer category added." });
        setNewItemName("");
        setAddOpen(false);
    };

    const openDeleteDialog = (item: ListItem) => {
        setItemToDelete(item);
        setDeleteAlertOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        toast({ title: "Success", description: "Customer category deleted." });
        setDeleteAlertOpen(false);
        setItemToDelete(null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Manage Customer Categories</CardTitle>
                <Button onClick={() => setAddOpen(true)}><PlusCircle className="mr-2"/>Add New Category</Button>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Customer Category</DialogTitle>
                    <DialogDescription>Enter the name for the new customer category.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input placeholder="Category Name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAddItem}>Add Category</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer category "{itemToDelete?.name}".
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
