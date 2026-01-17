
'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
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
import type { TransactionType } from "@/app/(main)/limits/types/page";

interface TransactionTypesClientProps {
  initialItems: TransactionType[];
}

export function TransactionTypesClient({
  initialItems,
}: TransactionTypesClientProps) {
  const [items, setItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TransactionType | null>(null);
  const [newItem, setNewItem] = useState({ code: '', name: '', description: '' });
  const { toast } = useToast();

  const handleAddItem = async () => {
    if (!newItem.code || !newItem.name) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Code and Name are required.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/limits/transaction-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setItems((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: 'Success', description: 'New transaction type added.' });
      setNewItem({ code: '', name: '', description: '' });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
     try {
      const res = await fetch('/api/limits/transaction-types', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      });
      if (res.status !== 204) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete');
      }
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      toast({ title: 'Success', description: 'Transaction type deleted.' });
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Manage Transaction Types</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2" />
            Add Type
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.code}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <Input placeholder="Type Code (e.g., P2P)" value={newItem.code} onChange={(e) => setNewItem(prev => ({...prev, code: e.target.value}))}/>
             <Input placeholder="Type Name (e.g., Person-to-Person Transfer)" value={newItem.name} onChange={(e) => setNewItem(prev => ({...prev, name: e.target.value}))}/>
             <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}/>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAddItem} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete the type "{itemToDelete?.name}".</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Delete
                </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
