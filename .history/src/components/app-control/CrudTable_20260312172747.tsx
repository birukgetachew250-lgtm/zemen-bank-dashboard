"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Loader2, Edit, Search } from "lucide-react";

export interface ColumnDef {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

interface CrudTableProps {
  title: string;
  apiUrl: string;
  idField: string;
  columns: ColumnDef[];
  formFields: FieldDef[];
  searchKeys?: string[];
  defaultValues?: Record<string, any>;
  dialogClassName?: string;
}

export default function CrudTable({ title, apiUrl, idField, columns, formFields, searchKeys = [], defaultValues = {}, dialogClassName }: CrudTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: `Failed to fetch ${title}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, title, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filteredItems = useMemo(() => {
    if (!searchTerm || searchKeys.length === 0) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => searchKeys.some((k) => String(item[k] || "").toLowerCase().includes(term)));
  }, [items, searchTerm, searchKeys]);

  const openAddDialog = () => {
    setEditingItem(null);
    const defaults: Record<string, any> = {};
    formFields.forEach((f) => { defaults[f.key] = defaultValues[f.key] ?? (f.type === "checkbox" ? false : f.type === "number" ? 0 : ""); });
    setFormData(defaults);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    const data: Record<string, any> = {};
    formFields.forEach((f) => {
      let val = item[f.key];
      if (f.type === "checkbox") val = val === 1 || val === true;
      else if (f.type === "number") val = val ?? 0;
      else val = val ?? "";
      data[f.key] = val;
    });
    setFormData(data);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isEdit = !!editingItem;
      const payload = isEdit ? { [idField]: editingItem[idField], ...formData } : formData;
      const res = await fetch(apiUrl, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || "Failed"); }
      toast({ title: isEdit ? "Updated" : "Created", description: `${title} ${isEdit ? "updated" : "created"} successfully` });
      setIsDialogOpen(false);
      fetchItems();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(apiUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idField]: itemToDelete[idField] }),
      });
      if (res.status !== 204 && !res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: `${title} deleted successfully` });
      setItemToDelete(null);
      fetchItems();
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const updateField = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-2">
              {searchKeys.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-8 w-64" />
                </div>
              )}
              <Button onClick={openAddDialog} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (<TableHead key={col.key}>{col.label}</TableHead>))}
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">No items found.</TableCell></TableRow>
                  ) : (
                    filteredItems.map((item, idx) => (
                      <TableRow key={item[idField] || idx}>
                        {columns.map((col) => (
                          <TableCell key={col.key}>
                            {col.render ? col.render(item[col.key], item) : (item[col.key] ?? "-")}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={dialogClassName || "max-w-2xl max-h-[85vh] overflow-y-auto"}>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} {title}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {formFields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "col-span-2" : ""}>
                <Label>{field.label}{field.required && <span className="text-red-500"> *</span>}</Label>
                {field.type === "select" ? (
                  <Select value={String(formData[field.key] || "")} onValueChange={(v: string) => updateField(field.key, v)}>
                    <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea value={formData[field.key] || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField(field.key, e.target.value)} placeholder={field.placeholder} rows={3} />
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" checked={!!formData[field.key]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field.key, e.target.checked)} className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">{field.placeholder || "Enabled"}</span>
                  </div>
                ) : (
                  <Input type={field.type || "text"} value={formData[field.key] ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field.key, field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} placeholder={field.placeholder} />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open: boolean) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
