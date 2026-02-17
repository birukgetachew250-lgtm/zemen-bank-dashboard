
'use client';

import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  MoreVertical
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Category {
  CategoryId: string;
  CategoryName: string;
  Description: string | null;
  LogoUrl: string | null;
  IconUrl: string | null;
  ColorHex: string | null;
  Status: string;
  Rank: number;
}

export function CategoryManagement({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    CategoryName: '',
    Description: '',
    IconUrl: '',
    ColorHex: '',
    Status: 'Active',
    Rank: '0'
  });

  const { toast } = useToast();

  const filtered = useMemo(() => 
    categories.filter(c => c.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, categories]
  );

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ CategoryName: '', Description: '', IconUrl: '', ColorHex: '', Status: 'Active', Rank: String(categories.length) });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      CategoryName: cat.CategoryName,
      Description: cat.Description || '',
      IconUrl: cat.IconUrl || '',
      ColorHex: cat.ColorHex || '',
      Status: cat.Status,
      Rank: String(cat.Rank)
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.CategoryName) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Category Name is required.' });
      return;
    }

    setIsSaving(true);
    const method = editingCategory ? 'PUT' : 'POST';
    const payload = editingCategory ? { CategoryId: editingCategory.CategoryId, ...formData } : formData;

    try {
      const res = await fetch('/api/bill-management/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      
      toast({ title: 'Success', description: 'Category saved successfully.' });
      setDialogOpen(false);
      // Simplified refresh
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const res = await fetch('/api/bill-management/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId })
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete category');
      toast({ title: 'Deleted', description: 'Category removed.' });
      setCategories(prev => prev.filter(c => c.CategoryId !== categoryId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Biller Categories</CardTitle>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search categories..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.CategoryId}>
                  <TableCell className="font-mono text-xs">{cat.Rank}</TableCell>
                  <TableCell className="font-semibold">{cat.CategoryName}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{cat.Description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: cat.ColorHex || '#ccc' }} />
                      <span className="text-xs font-mono">{cat.IconUrl}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(cat.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {cat.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(cat)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={e => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete &quot;{cat.CategoryName}&quot;. All associated subcategories and providers may be affected.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(cat.CategoryId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
            <DialogDescription>Set the display properties for this biller category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input className="col-span-3" value={formData.CategoryName} onChange={e => setFormData({...formData, CategoryName: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Description</Label>
              <Input className="col-span-3" value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Icon Name</Label>
              <Input className="col-span-3" value={formData.IconUrl} onChange={e => setFormData({...formData, IconUrl: e.target.value})} placeholder="e.g. receipt_long" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Theme Color</Label>
              <Input className="col-span-3" type="color" value={formData.ColorHex} onChange={e => setFormData({...formData, ColorHex: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Rank</Label>
              <Input className="col-span-3" type="number" value={formData.Rank} onChange={e => setFormData({...formData, Rank: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
