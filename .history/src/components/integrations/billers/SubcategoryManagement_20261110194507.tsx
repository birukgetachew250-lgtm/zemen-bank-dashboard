'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Layout,
  Smartphone,
  Globe,
  RefreshCw,
  ArrowRight,
  Settings2,
} from 'lucide-react';
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

export const CODED_APP_PAGES = [
  { route: '/bills/ethio-telecom', label: 'Ethio Telecom (Airtime / Package / Postpaid)' },
  { route: '/bills/safaricom', label: 'Safaricom Ethiopia (Airtime & Data)' },
  { route: '/bills/eeu-electricity', label: 'Ethiopian Electric Utility (EEU Bill Payment)' },
  { route: '/bills/aawsa-water', label: 'AAWSA Water Bill Payment' },
  { route: '/bills/ethiopian-airlines', label: 'Ethiopian Airlines Ticket Booking & Payment' },
  { route: '/bills/school-fee', label: 'School & Tuition Fee Payment' },
  { route: '/bills/dstv', label: 'DSTV Subscription Renewal' },
  { route: '/bills/canal-plus', label: 'Canal+ Subscription Payment' },
  { route: '/bills/guzogo', label: 'GuzoGo Flight & Travel Payment' },
  { route: '/bills/feres-ride', label: 'Feres / Ride Transport Wallet Top-up' },
  { route: '/bills/traffic-penalty', label: 'Traffic Penalty & Municipal Fines' },
  { route: '/bills/tax-customs', label: 'Ministry of Revenues / Tax & Customs' },
];

export interface Subcategory {
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

type SubcategoryTargetMode = 'providers' | 'direct_sdui' | 'coded_page' | 'mini_app';

function getSubcategoryMode(sub: Pick<Subcategory, 'IsMiniApp' | 'PageTemplate'>): SubcategoryTargetMode {
  if (Number(sub.IsMiniApp) === 1) return 'mini_app';
  const pt = Number(sub.PageTemplate ?? 1);
  if (pt === 2) return 'direct_sdui';
  if (pt === 3) return 'coded_page';
  return 'providers';
}

const EMPTY_FORM = {
  CategoryId: '',
  SubcategoryName: '',
  HoldingAccountId: '',
  TargetMode: 'providers' as SubcategoryTargetMode,
  IsMiniApp: false,
  IsBillable: true,
  WebUrl: '',
  ApiEndpoint: '',
  Description: '',
  LogoUrl: '',
  IconUrl: '',
  Status: 'Active',
  Rank: '0',
  PageTemplate: '1',
};

export function SubcategoryManagement({ initialSubcategories, categories }: { initialSubcategories: Subcategory[], categories: any[] }) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openingStudioId, setOpeningStudioId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const { toast } = useToast();
  const router = useRouter();

  const refetch = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/bill-management/subcategories?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (res.ok) {
        const data = await res.json();
        setSubcategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to refresh subcategories:', err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refetch(false);
  }, [refetch]);

  const filtered = useMemo(() =>
    subcategories.filter(s => {
      const matchesSearch =
        s.SubcategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.CategoryName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === 'all' || s.CategoryId === categoryFilter;
      return matchesSearch && matchesCat;
    }),
    [searchTerm, categoryFilter, subcategories]
  );

  const openAdd = () => {
    setEditingSub(null);
    setFormData({ ...EMPTY_FORM, Rank: String(subcategories.length) });
    setDialogOpen(true);
  };

  const openEdit = (sub: Subcategory) => {
    setEditingSub(sub);
    const mode = getSubcategoryMode(sub);
    setFormData({
      CategoryId: sub.CategoryId,
      SubcategoryName: sub.SubcategoryName,
      HoldingAccountId: sub.HoldingAccountId,
      TargetMode: mode,
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

  const handleModeChange = (mode: SubcategoryTargetMode) => {
    if (mode === 'mini_app') {
      setFormData(prev => ({ ...prev, TargetMode: mode, IsMiniApp: true, PageTemplate: '1' }));
    } else if (mode === 'direct_sdui') {
      setFormData(prev => ({ ...prev, TargetMode: mode, IsMiniApp: false, PageTemplate: '2' }));
    } else if (mode === 'coded_page') {
      setFormData(prev => ({
        ...prev,
        TargetMode: mode,
        IsMiniApp: false,
        PageTemplate: '3',
        WebUrl: prev.WebUrl || '/bills/ethio-telecom',
      }));
    } else {
      setFormData(prev => ({ ...prev, TargetMode: mode, IsMiniApp: false, PageTemplate: '1' }));
    }
  };

  const handleOpenDirectStudio = async (sub: Subcategory) => {
    setOpeningStudioId(sub.SubcategoryId);
    try {
      const res = await fetch('/api/bill-management/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ensure-direct-provider', SubcategoryId: sub.SubcategoryId }),
      });
      if (!res.ok) throw new Error('Failed to initialize direct subcategory page studio');
      router.push(`/integrations/billers/config/${sub.SubcategoryId}`);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setOpeningStudioId(null);
    }
  };

  const handleSave = async () => {
    if (!formData.SubcategoryName || !formData.CategoryId || !formData.HoldingAccountId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name, Category, and Holding Account are required.' });
      return;
    }
    if (formData.TargetMode === 'coded_page' && !formData.WebUrl.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select or enter the target coded mobile app route.' });
      return;
    }
    if (formData.TargetMode === 'mini_app' && !formData.WebUrl.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please enter the Mini-App Web URL.' });
      return;
    }

    setIsSaving(true);
    const method = editingSub ? 'PUT' : 'POST';
    const payload = {
      ...(editingSub ? { SubcategoryId: editingSub.SubcategoryId } : {}),
      CategoryId: formData.CategoryId,
      SubcategoryName: formData.SubcategoryName,
      HoldingAccountId: formData.HoldingAccountId,
      IsMiniApp: formData.TargetMode === 'mini_app',
      IsBillable: formData.IsBillable,
      WebUrl: formData.WebUrl,
      ApiEndpoint: formData.TargetMode === 'coded_page' ? formData.WebUrl : formData.ApiEndpoint,
      Description: formData.Description,
      LogoUrl: formData.LogoUrl,
      IconUrl: formData.IconUrl,
      Status: formData.Status,
      Rank: formData.Rank,
      PageTemplate:
        formData.TargetMode === 'direct_sdui'
          ? 2
          : formData.TargetMode === 'coded_page'
          ? 3
          : 1,
    };

    try {
      const res = await fetch('/api/bill-management/subcategories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Success', description: `Subcategory ${editingSub ? 'updated' : 'created'} successfully.` });
      setDialogOpen(false);
      await refetch(true);
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
        body: JSON.stringify({ id: subcategoryId }),
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete subcategory');
      toast({ title: 'Deleted', description: 'Subcategory and any direct page config removed.' });
      await refetch(true);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Biller Subcategories</CardTitle>
          <CardDescription>
            Configure whether a subcategory opens a Provider List, opens a Direct SDUI Page (no provider), redirects to a Pre-Coded App Screen, or launches a Mini-App.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subcategories..."
              className="pl-8 w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch(true)} title="Refresh directly from DB">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button onClick={openAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subcategory
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Logo</TableHead>
                <TableHead>Subcategory Name</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Navigation / Target Mode</TableHead>
                <TableHead>Holding Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => {
                const mode = getSubcategoryMode(sub);
                return (
                  <TableRow key={sub.SubcategoryId}>
                    <TableCell>
                      {sub.LogoUrl ? (
                        <img
                          src={sub.LogoUrl}
                          alt={sub.SubcategoryName}
                          className="h-9 w-9 rounded-lg object-cover ring-1 ring-border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{sub.SubcategoryName}</div>
                      {sub.Description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{sub.Description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.CategoryName}</Badge>
                    </TableCell>
                    <TableCell>
                      {mode === 'providers' && (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <Layers className="mr-1.5 h-3 w-3" /> Opens Provider List
                          </Badge>
                        </div>
                      )}
                      {mode === 'direct_sdui' && (
                        <div className="flex flex-col gap-1">
                          <Badge className="w-fit bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <Layout className="mr-1.5 h-3 w-3" /> Direct SDUI Page (No Provider)
                          </Badge>
                        </div>
                      )}
                      {mode === 'coded_page' && (
                        <div className="flex flex-col gap-1">
                          <Badge className="w-fit bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300">
                            <Smartphone className="mr-1.5 h-3 w-3" /> Pre-Coded App Page (No Provider)
                          </Badge>
                          {sub.WebUrl && (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              Route: {sub.WebUrl}
                            </span>
                          )}
                        </div>
                      )}
                      {mode === 'mini_app' && (
                        <div className="flex flex-col gap-1">
                          <Badge className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300">
                            <Globe className="mr-1.5 h-3 w-3" /> Web Mini-App
                          </Badge>
                          {sub.WebUrl && (
                            <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {sub.WebUrl}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{sub.HoldingAccountId}</TableCell>
                    <TableCell>
                      <Badge className={cn(sub.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                        {sub.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {mode === 'providers' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => router.push(`/integrations/billers/providers?categoryId=${sub.CategoryId}&subcategoryId=${sub.SubcategoryId}`)}
                          >
                            Providers <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        )}
                        {mode === 'direct_sdui' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={openingStudioId === sub.SubcategoryId}
                            onClick={() => handleOpenDirectStudio(sub)}
                          >
                            {openingStudioId === sub.SubcategoryId ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Design Direct Page
                          </Button>
                        )}
                        {mode === 'coded_page' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
                            onClick={() => openEdit(sub)}
                          >
                            <Smartphone className="mr-1.5 h-3.5 w-3.5" /> Edit Coded Route
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(sub)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Subcategory
                            </DropdownMenuItem>
                            {mode === 'direct_sdui' && (
                              <DropdownMenuItem onClick={() => handleOpenDirectStudio(sub)}>
                                <Settings2 className="mr-2 h-4 w-4" /> Design Direct SDUI Page
                              </DropdownMenuItem>
                            )}
                            {mode === 'providers' && (
                              <DropdownMenuItem onClick={() => router.push(`/integrations/billers/providers?categoryId=${sub.CategoryId}&subcategoryId=${sub.SubcategoryId}`)}>
                                <Layers className="mr-2 h-4 w-4" /> Manage Providers
                              </DropdownMenuItem>
                            )}
                            {sub.LogoUrl && (
                              <DropdownMenuItem asChild>
                                <a href={sub.LogoUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" /> View Logo
                                </a>
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600" onSelect={e => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete &quot;{sub.SubcategoryName}&quot; and any direct SDUI page configuration attached to it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(sub.SubcategoryId)} className="bg-red-600 hover:bg-red-700">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No subcategories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Edit' : 'Add'} Subcategory</DialogTitle>
            <DialogDescription>
              Configure subcategory details, behavior when tapped (provider list vs. direct page vs. pre-coded app page), and branding.
            </DialogDescription>
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
                <Input value={formData.SubcategoryName} onChange={e => set('SubcategoryName', e.target.value)} placeholder="e.g. Water Utilities or GuzoGo" />
              </div>
            </div>

            {/* Subcategory Navigation / Behavior Mode */}
            <div className="space-y-2.5 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Label className="text-sm font-semibold">
                When User Selects This Subcategory in the App:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleModeChange('providers')}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    formData.TargetMode === 'providers'
                      ? "border-primary bg-background shadow-sm ring-2 ring-primary/20"
                      : "border-border/70 bg-background/60 hover:bg-background"
                  )}
                >
                  <Layers className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">1. Show Providers List</p>
                    <p className="text-[11px] text-muted-foreground">
                      Opens a list of child bill providers under this subcategory.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('direct_sdui')}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    formData.TargetMode === 'direct_sdui'
                      ? "border-emerald-600 bg-background shadow-sm ring-2 ring-emerald-500/20"
                      : "border-border/70 bg-background/60 hover:bg-background"
                  )}
                >
                  <Layout className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">2. Direct SDUI Page (No Provider)</p>
                    <p className="text-[11px] text-muted-foreground">
                      No provider list — directly opens a dynamic SDUI form designed in Studio.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('coded_page')}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    formData.TargetMode === 'coded_page'
                      ? "border-purple-600 bg-background shadow-sm ring-2 ring-purple-500/20"
                      : "border-border/70 bg-background/60 hover:bg-background"
                  )}
                >
                  <Smartphone className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">3. Redirect to Coded App Page</p>
                    <p className="text-[11px] text-muted-foreground">
                      No provider list — redirects directly to an already-coded screen in the mobile app.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('mini_app')}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    formData.TargetMode === 'mini_app'
                      ? "border-blue-600 bg-background shadow-sm ring-2 ring-blue-500/20"
                      : "border-border/70 bg-background/60 hover:bg-background"
                  )}
                >
                  <Globe className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">4. Web Mini-App URL</p>
                    <p className="text-[11px] text-muted-foreground">
                      Launches an embedded web mini-app via URL.
                    </p>
                  </div>
                </button>
              </div>

              {formData.TargetMode === 'coded_page' && (
                <div className="mt-3 space-y-3 rounded-lg border border-purple-200 bg-background p-3.5 dark:border-purple-900">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Select Pre-Coded Mobile App Page Preset
                    </Label>
                    <Select
                      value={CODED_APP_PAGES.some(p => p.route === formData.WebUrl) ? formData.WebUrl : 'custom'}
                      onValueChange={(v) => {
                        if (v !== 'custom') set('WebUrl', v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a coded app screen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CODED_APP_PAGES.map((page) => (
                          <SelectItem key={page.route} value={page.route}>
                            {page.label} ({page.route})
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom App Route / Screen Key...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Mobile App Route / Screen Key <span className="text-red-500">*</span></Label>
                    <Input
                      className="font-mono text-xs"
                      value={formData.WebUrl}
                      onChange={e => set('WebUrl', e.target.value)}
                      placeholder="/bills/ethio-telecom or nativeScreenKey"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      The mobile app will navigate directly to this coded screen when the user taps this subcategory.
                    </p>
                  </div>
                </div>
              )}

              {formData.TargetMode === 'direct_sdui' && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-background p-3 text-xs text-muted-foreground dark:border-emerald-900">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Direct SDUI Page Enabled:</span> After saving this subcategory, click <strong>&quot;Design Direct Page&quot;</strong> in the table to open the Visual Form &amp; Flow Designer directly for this subcategory without creating child providers.
                </div>
              )}

              {formData.TargetMode === 'mini_app' && (
                <div className="mt-3 space-y-1.5 rounded-lg border border-blue-200 bg-background p-3 dark:border-blue-900">
                  <Label className="text-xs">Mini-App Web URL <span className="text-red-500">*</span></Label>
                  <Input
                    type="url"
                    value={formData.WebUrl}
                    onChange={e => set('WebUrl', e.target.value)}
                    placeholder="https://miniapp.example.com"
                  />
                </div>
              )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Logo URL</Label>
                  <Input type="url" value={formData.LogoUrl} onChange={e => set('LogoUrl', e.target.value)} placeholder="https://cdn.example.com/logo.png" />
                </div>
                <div className="space-y-1.5">
                  <Label>Icon URL / Name</Label>
                  <Input value={formData.IconUrl} onChange={e => set('IconUrl', e.target.value)} placeholder="https://cdn.example.com/icon.png" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={formData.Description} onChange={e => set('Description', e.target.value)} rows={2} placeholder="Brief description of this subcategory..." />
            </div>

            {/* Billable + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm">Billable</Label>
                  <p className="text-xs text-muted-foreground">Can bills be paid here?</p>
                </div>
                <Switch checked={formData.IsBillable as boolean} onCheckedChange={v => set('IsBillable', v)} />
              </div>
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
