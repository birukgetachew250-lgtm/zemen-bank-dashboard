
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  MoreVertical,
  ExternalLink
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Subcategory {
  SubcategoryId: string;
  CategoryId: string;
  SubcategoryName: string;
  CategoryName: string;
  HoldingAccountId: string;
  IsMiniApp: number;
  IsBillable: number;
  Status: string;
  Rank: number;
  WebUrl: string | null;
}

export function SubcategoryManagement({ initialSubcategories, categories }: { initialSubcategories: Subcategory[], categories: any[] }) {
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  
  const [formData, setFormData] = useState({
    CategoryId: '',
    SubcategoryName: '',
    HoldingAccountId: '',
    IsMiniApp: false,
    IsBillable: true,
    WebUrl: '',
    Status: 'Active',
    Rank: '0'
  });

  const { toast } = useToast();

  const filtered = useMemo(() => 
    subcategories.filter(s => s.SubcategoryName.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, subcategories]
  );

  const openAdd = () => {
    setEditingSub(null);
    setFormData({ CategoryId: '', SubcategoryName: '', HoldingAccountId: '', IsMiniApp: false, IsBillable: true, WebUrl: '', Status: 'Active', Rank: String(subcategories.length) });
    setDialogOpen(true);
  };

  const openEdit = (sub: Subcategory) => {
    setEditingSub(sub);
    setFormData({
      CategoryId: sub.CategoryId,
      SubcategoryName: sub.SubcategoryName,
      HoldingAccountId: sub.HoldingAccountId,
      IsMiniApp: sub.IsMiniApp === 1,
      IsBillable: sub.IsBillable === 1,
      WebUrl: sub.WebUrl || '',
      Status: sub.Status,
      Rank: String(sub.Rank)
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.SubcategoryName || !formData.CategoryId || !formData.HoldingAccountId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name, Category, and Holding Account are required.' });
      return;
    }

    setIsSaving(true);
    const method = editingSub ? 'PUT' : 'POST';
    const payload = editingSub ? { SubcategoryId: editingSub.SubcategoryId, ...formData } : formData;

    try {
      const res = await fetch('/api/bill-management/subcategories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      
      toast({ title: 'Success', description: 'Subcategory saved successfully.' });
      setDialogOpen(false);
      // Refetch subcategories from API instead of full page reload
      const refreshed = await fetch('/api/bill-management/subcategories');
      if (refreshed.ok) {
        const data = await refreshed.json();
        setSubcategories(Array.isArray(data) ? data : data.value || []);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (subcategoryId: string) => {
    try {
      const res = await fetch('/api/bill-management/subcategories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subcategoryId })
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete subcategory');
      toast({ title: 'Deleted', description: 'Subcategory removed.' });
      setSubcategories(prev => prev.filter(s => s.SubcategoryId !== subcategoryId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Biller Subcategories</CardTitle>
        <div className="flex items-center gap-4">
          <Input placeholder="Search..." className="w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Subcategory</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcategory Name</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Holding Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.SubcategoryId}>
                  <TableCell className="font-semibold">{sub.SubcategoryName}</TableCell>
                  <TableCell><Badge variant="outline">{sub.CategoryName}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{sub.HoldingAccountId}</TableCell>
                  <TableCell>
                    {sub.IsMiniApp === 1 ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Mini App</Badge>
                    ) : (
                      <Badge variant="outline">Native</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(sub.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {sub.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(sub)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={e => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete &quot;{sub.SubcategoryName}&quot;. All associated providers may be affected.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sub.SubcategoryId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Edit' : 'Add'} Subcategory</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={formData.CategoryId} onValueChange={v => setFormData({...formData, CategoryId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory Name</Label>
                <Input value={formData.SubcategoryName} onChange={e => setFormData({...formData, SubcategoryName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Holding Account ID (FlexCube)</Label>
                <Input className="font-mono" value={formData.HoldingAccountId} onChange={e => setFormData({...formData, HoldingAccountId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Rank</Label>
                <Input type="number" value={formData.Rank} onChange={e => setFormData({...formData, Rank: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Mini App Integration</Label>
                <p className="text-xs text-muted-foreground">Is this service a web-based mini app?</p>
              </div>
              <Switch checked={formData.IsMiniApp} onCheckedChange={v => setFormData({...formData, IsMiniApp: v})} />
            </div>
            {formData.IsMiniApp && (
              <div className="space-y-2">
                <Label>Web URL</Label>
                <Input type="url" value={formData.WebUrl} onChange={e => setFormData({...formData, WebUrl: e.target.value})} placeholder="https://..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
