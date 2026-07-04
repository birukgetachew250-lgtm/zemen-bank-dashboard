
'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Search, Edit, Trash2, Loader2, MoreVertical, Image as ImageIcon, ExternalLink } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ApiEndpoint: string | null;
  Description: string | null;
  LogoUrl: string | null;
  IconUrl: string | null;
  PageTemplate: number | null;
}

const EMPTY_FORM = {
  CategoryId: '', SubcategoryName: '', HoldingAccountId: '',
  IsMiniApp: false, IsBillable: true, WebUrl: '', ApiEndpoint: '',
  Description: '', LogoUrl: '', IconUrl: '', Status: 'Active', Rank: '0', PageTemplate: '1',
};

export function SubcategoryManagement({ initialSubcategories, categories }: { initialSubcategories: Subcategory[], categories: any[] }) {
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const { toast } = useToast();

  const filtered = useMemo(() =>
    subcategories.filter(s => s.SubcategoryName.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, subcategories]
  );

  const refetch = useCallback(async () => {
    const res = await fetch('/api/bill-management/subcategories', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
    if (res.ok) {
      const data = await res.json();
      setSubcategories(Array.isArray(data) ? data : []);
    }
  }, []);

  const openAdd = () => {
    setEditingSub(null);
    setFormData({ ...EMPTY_FORM, Rank: String(subcategories.length) });
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
      ApiEndpoint: sub.ApiEndpoint || '',
      Description: sub.Description || '',
      LogoUrl: sub.LogoUrl || '',
      IconUrl: sub.IconUrl || '',
      Status: sub.Status,
      Rank: String(sub.Rank),
      PageTemplate: String(sub.PageTemplate ?? 1),
    });
    setDialogOpen(true);
  };

  const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

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
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Success', description: `Subcategory ${editingSub ? 'updated' : 'created'} successfully.` });
      setDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (subcategoryId: string) => {
    try {
      const res = await fetch('/api/bill-management/subcategories', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subcategoryId })
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete subcategory');
      toast({ title: 'Deleted', description: 'Subcategory removed.' });
      await refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Biller Subcategories</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Subcategory</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
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
                  <TableCell>
                    {sub.LogoUrl ? (
                      <img src={sub.LogoUrl} alt={sub.SubcategoryName} className="h-8 w-8 rounded-lg object-cover ring-1 ring-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
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
                        {sub.LogoUrl && (
                          <DropdownMenuItem asChild>
                            <a href={sub.LogoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Logo</a>
                          </DropdownMenuItem>
                        )}
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
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No subcategories found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Edit' : 'Add'} Subcategory</DialogTitle>
            <DialogDescription>Configure subcategory details, holding account, and branding assets.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Parent Category <span className="text-red-500">*</span></Label>
                <Select value={formData.CategoryId} onValueChange={v => set('CategoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subcategory Name <span className="text-red-500">*</span></Label>
                <Input value={formData.SubcategoryName} onChange={e => set('SubcategoryName', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Holding Account ID (FlexCube) <span className="text-red-500">*</span></Label>
                <Input className="font-mono" value={formData.HoldingAccountId} onChange={e => set('HoldingAccountId', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Rank (display order)</Label>
                <Input type="number" value={formData.Rank} onChange={e => set('Rank', e.target.value)} />
              </div>
            </div>

            {/* Branding / Logo URLs */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Branding Assets</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label>Logo URL</Label>
                  <Input type="url" value={formData.LogoUrl} onChange={e => set('LogoUrl', e.target.value)} placeholder="https://cdn.example.com/logo.png" />
                  {formData.LogoUrl && (
                    <div className="mt-1 flex items-center gap-2">
                      <img src={formData.LogoUrl} alt="Logo preview" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Icon URL</Label>
                  <Input type="url" value={formData.IconUrl} onChange={e => set('IconUrl', e.target.value)} placeholder="https://cdn.example.com/icon.png" />
                  {formData.IconUrl && (
                    <div className="mt-1 flex items-center gap-2">
                      <img src={formData.IconUrl} alt="Icon preview" className="h-8 w-8 rounded object-cover ring-1 ring-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={formData.Description} onChange={e => set('Description', e.target.value)} rows={2} placeholder="Brief description of this subcategory..." />
            </div>

            {/* Flags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm">Mini App Integration</Label>
                  <p className="text-xs text-muted-foreground">Is this a web mini app?</p>
                </div>
                <Switch checked={formData.IsMiniApp as boolean} onCheckedChange={v => set('IsMiniApp', v)} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm">Billable</Label>
                  <p className="text-xs text-muted-foreground">Can bills be paid here?</p>
                </div>
                <Switch checked={formData.IsBillable as boolean} onCheckedChange={v => set('IsBillable', v)} />
              </div>
            </div>

            {formData.IsMiniApp && (
              <div className="space-y-1.5">
                <Label>Web URL</Label>
                <Input type="url" value={formData.WebUrl} onChange={e => set('WebUrl', e.target.value)} placeholder="https://..." />
              </div>
            )}

            {/* Status + Page Template */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={formData.Status} onValueChange={v => set('Status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Page Template</Label>
                <Select value={String(formData.PageTemplate)} onValueChange={v => set('PageTemplate', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Standard (1)</SelectItem>
                    <SelectItem value="2">Custom (2)</SelectItem>
                    <SelectItem value="3">Full-Page (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSub ? 'Update' : 'Create'} Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
