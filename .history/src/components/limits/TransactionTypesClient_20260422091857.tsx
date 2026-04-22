
'use client';

import { useState, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Loader2, Edit, Search, Upload } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { TransactionType } from "@/app/(main)/limits/types/page";

interface TransactionTypesClientProps {
  initialItems: TransactionType[];
}

export function TransactionTypesClient({
  initialItems,
}: TransactionTypesClientProps) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<TransactionType[] | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TransactionType | null>(null);
  const [editingItem, setEditingItem] = useState<TransactionType | null>(null);
  const [newItem, setNewItem] = useState({ code: '', name: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (i) =>
        i.code.toLowerCase().includes(term) ||
        i.name.toLowerCase().includes(term) ||
        (i.description || "").toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const openAddDialog = () => {
    setEditingItem(null);
    setNewItem({ code: '', name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: TransactionType) => {
    setEditingItem(item);
    setNewItem({ code: item.code, name: item.name, description: item.description });
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!newItem.code || !newItem.name) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Code and Name are required." });
      return;
    }
    setIsSaving(true);
    const method = editingItem ? 'PUT' : 'POST';
    const payload = editingItem ? { id: editingItem.id, ...newItem } : newItem;
    try {
      const res = await fetch('/api/limits/transaction-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      if (editingItem) {
        setItems(prev => prev.map(i => i.id === editingItem.id ? result : i));
        toast({ title: 'Success', description: 'Transaction type updated.' });
      } else {
        setItems((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: 'Success', description: 'New transaction type added.' });
      }
      setNewItem({ code: '', name: '', description: '' });
      setEditingItem(null);
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
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const { read, utils } = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = utils.sheet_to_json(ws, { defval: '' });
      const parsed: TransactionType[] = rows
        .filter((r) => r.Code || r.code)
        .map((r) => ({
          id: '',
          code: String(r.Code || r.code || '').trim(),
          name: String(r.Name || r.name || '').trim(),
          description: String(r.Description || r.description || '').trim(),
        }))
        .filter((r) => r.code && r.name);
      if (parsed.length === 0) {
        toast({ variant: 'destructive', title: 'No valid rows', description: 'Ensure columns: Code, Name, Description' });
        return;
      }
      setImportPreview(parsed);
      setIsImportDialogOpen(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to read Excel file.' });
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/limits/transaction-types/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importPreview }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      const added = result.created as TransactionType[];
      setItems((prev) => [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: 'Import successful', description: `${added.length} transaction type(s) imported.` });
      setIsImportDialogOpen(false);
      setImportPreview(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Import failed', description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Transaction Types</CardTitle>
            <CardDescription>Define the types of transactions used in limit and charge rules.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search code or name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-56"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button size="sm" onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
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
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No transaction types found.</TableCell>
                  </TableRow>
                ) : filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)}>
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
      
      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Transaction Type' : 'Add New Transaction Type'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Type Code (e.g., P2P)" value={newItem.code} onChange={(e) => setNewItem(prev => ({...prev, code: e.target.value}))}/>
            <Input placeholder="Type Name (e.g., Person-to-Person Transfer)" value={newItem.name} onChange={(e) => setNewItem(prev => ({...prev, name: e.target.value}))}/>
            <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}/>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => { if (!open) { setIsImportDialogOpen(false); setImportPreview(null); }}}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Preview — {importPreview?.length ?? 0} row(s)</DialogTitle>
          </DialogHeader>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importPreview?.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Duplicate codes will be skipped. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsImportDialogOpen(false); setImportPreview(null); }}>Cancel</Button>
            <Button onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the type &quot;{itemToDelete?.name}&quot;.</AlertDialogDescription>
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
  const [editingItem, setEditingItem] = useState<TransactionType | null>(null);
  const [newItem, setNewItem] = useState({ code: '', name: '', description: '' });
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingItem(null);
    setNewItem({ code: '', name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: TransactionType) => {
    setEditingItem(item);
    setNewItem({ code: item.code, name: item.name, description: item.description });
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!newItem.code || !newItem.name) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Code and Name are required.",
      });
      return;
    }
    setIsSaving(true);
    const method = editingItem ? 'PUT' : 'POST';
    const payload = editingItem ? { id: editingItem.id, ...newItem } : newItem;
    try {
      const res = await fetch('/api/limits/transaction-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      if (editingItem) {
        setItems(prev => prev.map(i => i.id === editingItem.id ? result : i));
        toast({ title: 'Success', description: 'Transaction type updated.' });
      } else {
        setItems((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: 'Success', description: 'New transaction type added.' });
      }
      setNewItem({ code: '', name: '', description: '' });
      setEditingItem(null);
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
          <Button onClick={openAddDialog}>
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
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>{editingItem ? 'Edit Transaction Type' : 'Add New Transaction Type'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <Input placeholder="Type Code (e.g., P2P)" value={newItem.code} onChange={(e) => setNewItem(prev => ({...prev, code: e.target.value}))}/>
             <Input placeholder="Type Name (e.g., Person-to-Person Transfer)" value={newItem.name} onChange={(e) => setNewItem(prev => ({...prev, name: e.target.value}))}/>
             <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}/>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveItem} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {editingItem ? 'Update' : 'Add'}
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
