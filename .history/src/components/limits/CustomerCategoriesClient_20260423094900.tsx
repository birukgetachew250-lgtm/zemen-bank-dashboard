
'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2, Edit, Search, Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/app/(main)/limits/categories/page';

interface CustomerCategoriesClientProps {
  initialItems: Category[];
}

export function CustomerCategoriesClient({
  initialItems,
}: CustomerCategoriesClientProps) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Category[] | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [newItem, setNewItem] = useState({ code: '', name: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const openAddDialog = () => {
    setEditingItem(null);
    setNewItem({ code: '', name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Category) => {
    setEditingItem(item);
    setNewItem({ code: item.code, name: item.name, description: item.description });
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!newItem.code || !newItem.name) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Code and Name are required.',
      });
      return;
    }

    setIsSaving(true);
    const method = editingItem ? 'PUT' : 'POST';
    const payload = editingItem ? { id: editingItem.id, ...newItem } : newItem;

    try {
      const res = await fetch('/api/limits/customer-categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to save category');
      }

      if (editingItem) {
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? result : item)));
        toast({ title: 'Success', description: 'Category updated.' });
      } else {
        setItems((prev) => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: 'Success', description: 'New category added.' });
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
    if (!itemToDelete) {
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/limits/customer-categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      if (res.status !== 204) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete');
      }

      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      toast({ title: 'Success', description: 'Category deleted.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
      setItemToDelete(null);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = '';

    try {
      const { read, utils } = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = utils.sheet_to_json(worksheet, { defval: '' });

      const parsed: Category[] = rows
        .filter((row) => row.Code || row.code)
        .map((row) => ({
          id: '',
          code: String(row.Code || row.code || '').trim(),
          name: String(row.Name || row.name || '').trim(),
          description: String(row.Description || row.description || '').trim(),
        }))
        .filter((row) => row.code && row.name);

      if (parsed.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No valid rows',
          description: 'Ensure columns: Code, Name, Description',
        });
        return;
      }

      setImportPreview(parsed);
      setIsImportDialogOpen(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to read Excel file.' });
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) {
      return;
    }

    setIsImporting(true);

    try {
      const res = await fetch('/api/limits/customer-categories/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importPreview }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to import categories');
      }

      const added = result.created as Category[];
      setItems((prev) => [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: 'Import successful', description: `${added.length} categories imported.` });
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
            <CardTitle>Manage Customer Categories</CardTitle>
            <CardDescription>Categories are used to group customers for limit and charge rules.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search code or name..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
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
              Add Category
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
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No customer categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isDialogOpen && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Customer Category' : 'Add New Customer Category'}</CardTitle>
            <CardDescription>Provide category details and save your changes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 py-2">
            <Input
              placeholder="Category Code"
              value={newItem.code}
              onChange={(event) => setNewItem((prev) => ({ ...prev, code: event.target.value }))}
            />
            <Input
              placeholder="Category Name"
              value={newItem.name}
              onChange={(event) => setNewItem((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="Description"
              value={newItem.description}
              onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))}
            />
          </CardContent>
          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </Card>
      )}

      {isImportDialogOpen && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Import Preview - {importPreview?.length ?? 0} row(s)</CardTitle>
          </CardHeader>
          <CardContent>
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
                {importPreview?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Duplicate codes will be skipped. This cannot be undone.
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Import
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &quot;{itemToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
