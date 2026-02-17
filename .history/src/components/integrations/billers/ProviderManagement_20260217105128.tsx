
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Settings2,
  ExternalLink,
  Filter
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
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
import { cn } from '@/lib/utils';

interface Provider {
  ProviderId: string;
  CategoryId: string;
  SubcategoryId: string | null;
  ProviderName: string;
  ProviderCode: string;
  CategoryName: string;
  SubcategoryName: string | null;
  HoldingAccountId: string;
  Status: string;
  Rank: number;
}

export function ProviderManagement({ initialProviders, categories, subcategories }: { initialProviders: Provider[], categories: any[], subcategories: any[] }) {
  const [providers, setProviders] = useState(initialProviders);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  
  const [formData, setFormData] = useState({
    CategoryId: '',
    SubcategoryId: '',
    ProviderName: '',
    ProviderCode: '',
    HoldingAccountId: '',
    Status: 'Active',
    Rank: '0'
  });

  const router = useRouter();
  const { toast } = useToast();

  const filtered = useMemo(() => 
    providers.filter(p => {
      const matchesSearch = p.ProviderName.toLowerCase().includes(searchTerm.toLowerCase()) || p.ProviderCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.CategoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    }),
    [searchTerm, categoryFilter, providers]
  );

  const filteredSubcategories = useMemo(() => 
    subcategories.filter(s => s.CategoryId === formData.CategoryId),
    [formData.CategoryId, subcategories]
  );

  const openAdd = () => {
    setEditingProvider(null);
    setFormData({ CategoryId: '', SubcategoryId: '', ProviderName: '', ProviderCode: '', HoldingAccountId: '', Status: 'Active', Rank: String(providers.length) });
    setDialogOpen(true);
  };

  const openEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      CategoryId: provider.CategoryId,
      SubcategoryId: provider.SubcategoryId || '',
      ProviderName: provider.ProviderName,
      ProviderCode: provider.ProviderCode,
      HoldingAccountId: provider.HoldingAccountId,
      Status: provider.Status,
      Rank: String(provider.Rank),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.ProviderName || !formData.ProviderCode || !formData.CategoryId || !formData.HoldingAccountId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name, Code, Category, and Account are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/bill-management/providers', {
        method: editingProvider ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProvider ? { ProviderId: editingProvider.ProviderId, ...formData } : formData)
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Success', description: 'Provider saved successfully.' });
      setDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    try {
      const res = await fetch('/api/bill-management/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: providerId })
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete provider');
      toast({ title: 'Deleted', description: 'Provider removed.' });
      setProviders(prev => prev.filter(p => p.ProviderId !== providerId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered Bill Providers</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name or code..." className="pl-8 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Register Provider</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Taxonomy</TableHead>
                  <TableHead>Holding Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.ProviderId}>
                    <TableCell className="font-bold">{p.ProviderName}</TableCell>
                    <TableCell className="font-mono text-xs">{p.ProviderCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold">{p.CategoryName}</span>
                        {p.SubcategoryName && <span className="text-[10px] text-muted-foreground">{p.SubcategoryName}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.HoldingAccountId}</TableCell>
                    <TableCell>
                      <Badge className={cn(p.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                        {p.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/integrations/billers/config/${p.ProviderId}`)}>
                          <Settings2 className="mr-1 h-4 w-4" /> Configure
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Provider?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete &quot;{p.ProviderName}&quot; and all its SDUI configuration (fields, steps, API config, display fields).</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.ProviderId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProvider ? 'Edit' : 'Register New'} Provider</DialogTitle>
            <DialogDescription>{editingProvider ? 'Update provider details.' : 'Add a new biller to the system and map it to a FlexCube account.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input value={formData.ProviderName} onChange={e => setFormData({...formData, ProviderName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Provider Unique Code</Label>
                <Input className="font-mono" value={formData.ProviderCode} onChange={e => setFormData({...formData, ProviderCode: e.target.value.toUpperCase()})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.CategoryId} onValueChange={v => setFormData({...formData, CategoryId: v, SubcategoryId: ''})}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory (Optional)</Label>
                <Select value={formData.SubcategoryId} onValueChange={v => setFormData({...formData, SubcategoryId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {filteredSubcategories.map(s => <SelectItem key={s.SubcategoryId} value={s.SubcategoryId}>{s.SubcategoryName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Holding Account ID</Label>
                <Input className="font-mono" value={formData.HoldingAccountId} onChange={e => setFormData({...formData, HoldingAccountId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Display Rank</Label>
                <Input type="number" value={formData.Rank} onChange={e => setFormData({...formData, Rank: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingProvider ? 'Update Provider' : 'Register Provider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
