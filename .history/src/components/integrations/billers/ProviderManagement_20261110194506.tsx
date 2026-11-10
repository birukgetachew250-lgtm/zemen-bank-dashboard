'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Settings2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  FolderTree,
  Layers,
  Layout,
  Smartphone,
  Globe,
  CheckCircle2,
  Building2,
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
import { CODED_APP_PAGES } from './SubcategoryManagement';

interface Provider {
  ProviderId: string;
  CategoryId: string;
  SubcategoryId: string | null;
  ProviderName: string;
  ProviderCode: string;
  CategoryName: string;
  SubcategoryName: string | null;
  HoldingAccountId: string;
  ApiEndpoint?: string | null;
  PageTemplate?: number | null;
  Status: string;
  Rank: number;
}

export function ProviderManagement({
  initialProviders,
  categories: initialCategories,
  subcategories: initialSubcategories,
}: {
  initialProviders: Provider[];
  categories: any[];
  subcategories: any[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<any[]>(initialSubcategories);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Two-step navigation state: Step 1 = Select Category & Subcategory, Step 2 = Scoped Provider List
  const urlCatId = searchParams.get('categoryId') || '';
  const urlSubId = searchParams.get('subcategoryId') || '';

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(urlCatId || initialCategories[0]?.CategoryId || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(urlSubId || '');
  const [hasProceeded, setHasProceeded] = useState<boolean>(Boolean(urlCatId));

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  
  const [formData, setFormData] = useState({
    CategoryId: '',
    SubcategoryId: '',
    ProviderName: '',
    ProviderCode: '',
    HoldingAccountId: '',
    TargetMode: 'sdui' as 'sdui' | 'coded_page',
    ApiEndpoint: '',
    PageTemplate: '1',
    Status: 'Active',
    Rank: '0'
  });

  // Always fetch fresh data directly from the database (bypassing any cache)
  const refreshAllFromDb = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const ts = Date.now();
      const fetchOpts: RequestInit = {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      };
      const [provRes, catRes, subRes] = await Promise.all([
        fetch(`/api/bill-management/providers?t=${ts}`, fetchOpts),
        fetch(`/api/bill-management/categories?t=${ts}`, fetchOpts),
        fetch(`/api/bill-management/subcategories?t=${ts}`, fetchOpts),
      ]);

      if (provRes.ok) {
        const provData = await provRes.json();
        setProviders(Array.isArray(provData) ? provData : []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) setCategories(catData);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        if (Array.isArray(subData)) setSubcategories(subData);
      }
    } catch (error) {
      console.error('Failed to refresh bill providers from DB:', error);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshAllFromDb(false);
  }, [refreshAllFromDb]);

  // Filter out internal direct-subcategory container rows (where ProviderId === SubcategoryId)
  const visibleProviders = useMemo(
    () => providers.filter(p => !p.ProviderCode?.startsWith('DIRECT_SUBCAT_') && p.ProviderId !== p.SubcategoryId),
    [providers]
  );

  const selectedCategory = useMemo(
    () => categories.find(c => c.CategoryId === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const subcategoriesForSelectedCategory = useMemo(
    () => subcategories.filter(s => s.CategoryId === selectedCategoryId),
    [subcategories, selectedCategoryId]
  );

  const selectedSubcategory = useMemo(
    () => subcategories.find(s => s.SubcategoryId === selectedSubcategoryId) || null,
    [subcategories, selectedSubcategoryId]
  );

  // Auto-select first subcategory when category changes if none selected
  useEffect(() => {
    if (!selectedCategoryId) return;
    const subs = subcategories.filter(s => s.CategoryId === selectedCategoryId);
    if (subs.length > 0 && !subs.some(s => s.SubcategoryId === selectedSubcategoryId) && selectedSubcategoryId !== '__direct_category__' && selectedSubcategoryId !== '__all_in_category__') {
      setSelectedSubcategoryId(subs[0].SubcategoryId);
    } else if (subs.length === 0) {
      setSelectedSubcategoryId('__direct_category__');
    }
  }, [selectedCategoryId, subcategories, selectedSubcategoryId]);

  const scopedProviders = useMemo(() => {
    return visibleProviders.filter(p => {
      if (selectedCategoryId && p.CategoryId !== selectedCategoryId) return false;
      if (selectedSubcategoryId && selectedSubcategoryId !== '__all_in_category__') {
        if (selectedSubcategoryId === '__direct_category__') {
          if (p.SubcategoryId) return false;
        } else if (p.SubcategoryId !== selectedSubcategoryId) {
          return false;
        }
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.ProviderName.toLowerCase().includes(q);
        const matchesCode = p.ProviderCode.toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }
      return true;
    });
  }, [visibleProviders, selectedCategoryId, selectedSubcategoryId, searchTerm]);

  const filteredSubcategoriesForModal = useMemo(
    () => subcategories.filter(s => s.CategoryId === formData.CategoryId),
    [formData.CategoryId, subcategories]
  );

  const openAdd = () => {
    setEditingProvider(null);
    setFormData({
      CategoryId: selectedCategoryId || categories[0]?.CategoryId || '',
      SubcategoryId:
        selectedSubcategoryId &&
        selectedSubcategoryId !== '__all_in_category__' &&
        selectedSubcategoryId !== '__direct_category__'
          ? selectedSubcategoryId
          : 'none',
      ProviderName: '',
      ProviderCode: '',
      HoldingAccountId: selectedSubcategory?.HoldingAccountId || '',
      TargetMode: 'sdui',
      ApiEndpoint: '',
      PageTemplate: '1',
      Status: 'Active',
      Rank: String(scopedProviders.length + 1),
    });
    setDialogOpen(true);
  };

  const openEdit = (provider: Provider) => {
    setEditingProvider(provider);
    const isCodedPage = Number(provider.PageTemplate) === 3;
    setFormData({
      CategoryId: provider.CategoryId,
      SubcategoryId: provider.SubcategoryId || 'none',
      ProviderName: provider.ProviderName,
      ProviderCode: provider.ProviderCode,
      HoldingAccountId: provider.HoldingAccountId,
      TargetMode: isCodedPage ? 'coded_page' : 'sdui',
      ApiEndpoint: provider.ApiEndpoint || '',
      PageTemplate: String(provider.PageTemplate ?? 1),
      Status: provider.Status,
      Rank: String(provider.Rank),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.ProviderName || !formData.ProviderCode || !formData.CategoryId || !formData.HoldingAccountId) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Name, Code, Category, and Holding Account are required.' });
      return;
    }
    if (formData.TargetMode === 'coded_page' && !formData.ApiEndpoint.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select or enter the target pre-coded mobile app route.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(editingProvider ? { ProviderId: editingProvider.ProviderId } : {}),
        CategoryId: formData.CategoryId,
        SubcategoryId: formData.SubcategoryId === 'none' ? null : formData.SubcategoryId,
        ProviderName: formData.ProviderName,
        ProviderCode: formData.ProviderCode,
        HoldingAccountId: formData.HoldingAccountId,
        ApiEndpoint: formData.ApiEndpoint || null,
        PageTemplate: formData.TargetMode === 'coded_page' ? 3 : 1,
        Status: formData.Status,
        Rank: formData.Rank,
      };

      const res = await fetch('/api/bill-management/providers', {
        method: editingProvider ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Success', description: 'Provider saved directly to database.' });
      setDialogOpen(false);
      await refreshAllFromDb(true);
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
        body: JSON.stringify({ id: providerId }),
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete provider');
      toast({
        title: 'Provider & Configuration Deleted',
        description: 'Provider and all related SDUI fields, flow steps, API configs, and display fields were removed.',
      });
      await refreshAllFromDb(true);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleOpenSubcategoryDirectStudio = async (subId: string) => {
    try {
      const res = await fetch('/api/bill-management/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ensure-direct-provider', SubcategoryId: subId }),
      });
      if (!res.ok) throw new Error('Failed to initialize direct subcategory page');
      router.push(`/integrations/billers/config/${subId}`);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  // ============================================================================
  // STAGE 1: CATEGORY & SUBCATEGORY SELECTION GATE PAGE
  // ============================================================================
  if (!hasProceeded) {
    const selectedSubMode = selectedSubcategory
      ? Number(selectedSubcategory.IsMiniApp) === 1
        ? 'mini_app'
        : Number(selectedSubcategory.PageTemplate) === 2
        ? 'direct_sdui'
        : Number(selectedSubcategory.PageTemplate) === 3
        ? 'coded_page'
        : 'providers'
      : 'providers';

    return (
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <FolderTree className="h-3.5 w-3.5" /> Step 1 of 2 · Select Biller Taxonomy
                </div>
                <CardTitle className="text-xl">Choose Category &amp; Subcategory</CardTitle>
                <CardDescription>
                  Select a Biller Category and Subcategory below, then click <strong>Proceed to Providers</strong> to view and manage only that group&apos;s providers.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refreshAllFromDb(true)}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                  Refresh from DB
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* 1. Category Selection Grid */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Select Biller Category ({categories.length})
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const isSelected = cat.CategoryId === selectedCategoryId;
                  const catSubCount = subcategories.filter(s => s.CategoryId === cat.CategoryId).length;
                  const catProvCount = visibleProviders.filter(p => p.CategoryId === cat.CategoryId).length;
                  return (
                    <button
                      key={cat.CategoryId}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.CategoryId);
                        const firstSub = subcategories.find(s => s.CategoryId === cat.CategoryId);
                        setSelectedSubcategoryId(firstSub ? firstSub.SubcategoryId : '__direct_category__');
                      }}
                      className={cn(
                        "flex flex-col justify-between rounded-2xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                          : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3.5 w-3.5 rounded-full shrink-0 border"
                            style={{ backgroundColor: cat.ColorHex || '#10b981' }}
                          />
                          <span className="font-bold text-sm leading-tight">{cat.CategoryName}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                        <span>{catSubCount} Subcategories</span>
                        <span className="font-semibold text-foreground">{catProvCount} Providers</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Subcategory Selection Grid */}
            {selectedCategory && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    2. Select Subcategory under &quot;{selectedCategory.CategoryName}&quot;
                  </Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => router.push('/integrations/billers/subcategories')}
                  >
                    Manage Subcategories →
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subcategoriesForSelectedCategory.map((sub) => {
                    const isSelected = sub.SubcategoryId === selectedSubcategoryId;
                    const subProvCount = visibleProviders.filter(p => p.SubcategoryId === sub.SubcategoryId).length;
                    const mode =
                      Number(sub.IsMiniApp) === 1
                        ? 'mini_app'
                        : Number(sub.PageTemplate) === 2
                        ? 'direct_sdui'
                        : Number(sub.PageTemplate) === 3
                        ? 'coded_page'
                        : 'providers';

                    return (
                      <div
                        key={sub.SubcategoryId}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedSubcategoryId(sub.SubcategoryId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedSubcategoryId(sub.SubcategoryId);
                          }
                        }}
                        className={cn(
                          "flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                            : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-sm">{sub.SubcategoryName}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </div>

                          {mode === 'providers' && (
                            <Badge variant="outline" className="text-[10px]">
                              <Layers className="mr-1 h-3 w-3" /> Provider List ({subProvCount} Providers)
                            </Badge>
                          )}
                          {mode === 'direct_sdui' && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">
                              <Layout className="mr-1 h-3 w-3" /> Direct SDUI Page (No Child Providers)
                            </Badge>
                          )}
                          {mode === 'coded_page' && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-[10px]">
                              <Smartphone className="mr-1 h-3 w-3" /> Pre-Coded App Page ({sub.WebUrl || 'Route'})
                            </Badge>
                          )}
                          {mode === 'mini_app' && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px]">
                              <Globe className="mr-1 h-3 w-3" /> Web Mini-App
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            GL: {sub.HoldingAccountId}
                          </span>
                          {mode === 'direct_sdui' ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSubcategoryDirectStudio(sub.SubcategoryId);
                              }}
                            >
                              <Settings2 className="mr-1 h-3 w-3" /> Design Direct Page
                            </Button>
                          ) : (
                            <span className="font-semibold text-primary">
                              {subProvCount} {subProvCount === 1 ? 'Provider' : 'Providers'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Option: Direct under Category (no subcategory) */}
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategoryId('__direct_category__')}
                    className={cn(
                      "flex flex-col justify-between rounded-2xl border border-dashed p-4 text-left transition-all",
                      selectedSubcategoryId === '__direct_category__'
                        ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                        : "border-border/70 bg-muted/10 hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm">Unassigned / Direct in Category</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Providers linked directly to {selectedCategory.CategoryName} without a subcategory.
                        </p>
                      </div>
                      {selectedSubcategoryId === '__direct_category__' && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 text-xs font-semibold text-primary">
                      {visibleProviders.filter(p => p.CategoryId === selectedCategoryId && !p.SubcategoryId).length} Providers
                    </div>
                  </button>

                  {/* Option: All Subcategories in this Category */}
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategoryId('__all_in_category__')}
                    className={cn(
                      "flex flex-col justify-between rounded-2xl border border-dashed p-4 text-left transition-all",
                      selectedSubcategoryId === '__all_in_category__'
                        ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                        : "border-border/70 bg-muted/10 hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm">All in {selectedCategory.CategoryName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          View all providers across every subcategory in {selectedCategory.CategoryName}.
                        </p>
                      </div>
                      {selectedSubcategoryId === '__all_in_category__' && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 text-xs font-semibold text-primary">
                      {visibleProviders.filter(p => p.CategoryId === selectedCategoryId).length} Total Providers
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Footer / Proceed Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-muted/30 p-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Selected Scope: </span>
                <span className="font-bold">{selectedCategory?.CategoryName || 'None'}</span>
                <span className="mx-2 text-muted-foreground">→</span>
                <span className="font-bold text-primary">
                  {selectedSubcategory
                    ? selectedSubcategory.SubcategoryName
                    : selectedSubcategoryId === '__all_in_category__'
                    ? 'All Subcategories'
                    : 'Direct under Category'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {selectedSubcategory && selectedSubMode === 'direct_sdui' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleOpenSubcategoryDirectStudio(selectedSubcategory.SubcategoryId)}
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Design Subcategory Direct SDUI Page
                  </Button>
                )}
                <Button
                  size="lg"
                  disabled={!selectedCategoryId}
                  onClick={() => setHasProceeded(true)}
                >
                  Proceed to Providers ({scopedProviders.length}) <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // STAGE 2: SCOPED PROVIDERS VIEW FOR SELECTED CATEGORY & SUBCATEGORY
  // ============================================================================
  return (
    <div className="space-y-4">
      {/* Scope Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHasProceeded(false)}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Change Category / Subcategory
          </Button>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="font-semibold">
              {selectedCategory?.CategoryName || 'All Categories'}
            </Badge>
            <span className="text-muted-foreground">/</span>
            <Badge className="bg-primary/15 text-primary hover:bg-primary/20 font-semibold">
              {selectedSubcategory
                ? selectedSubcategory.SubcategoryName
                : selectedSubcategoryId === '__all_in_category__'
                ? 'All Subcategories'
                : 'Direct under Category'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshAllFromDb(true)}
            title="Fetch latest providers directly from Oracle DB"
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh from DB
          </Button>
          <Button size="sm" onClick={openAdd}>
            <PlusCircle className="mr-1.5 h-4 w-4" /> Register Provider
          </Button>
        </div>
      </div>

      {/* Warning banner if the selected subcategory is configured as a Direct Page / Coded Page without providers */}
      {selectedSubcategory && Number(selectedSubcategory.PageTemplate) === 2 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
          <div>
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              This Subcategory is configured as a &quot;Direct SDUI Page (No Provider List)&quot;
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              In the mobile app, tapping &quot;{selectedSubcategory.SubcategoryName}&quot; opens its direct SDUI form immediately instead of listing providers.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => handleOpenSubcategoryDirectStudio(selectedSubcategory.SubcategoryId)}
          >
            <Settings2 className="mr-1.5 h-4 w-4" /> Design Direct SDUI Page
          </Button>
        </div>
      )}

      {selectedSubcategory && Number(selectedSubcategory.PageTemplate) === 3 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-purple-300 bg-purple-50/80 p-4 text-sm dark:border-purple-800 dark:bg-purple-950/30">
          <div>
            <p className="font-bold text-purple-900 dark:text-purple-200">
              This Subcategory redirects directly to a Pre-Coded Mobile App Page
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Target Route: <code className="font-mono font-bold">{selectedSubcategory.WebUrl || 'Not set'}</code>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/integrations/billers/subcategories')}
          >
            Edit Subcategory Route
          </Button>
        </div>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>
              Providers in {selectedSubcategory ? selectedSubcategory.SubcategoryName : selectedCategory?.CategoryName}
            </CardTitle>
            <CardDescription>
              Showing {scopedProviders.length} provider(s) loaded directly from the database.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or code..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Taxonomy</TableHead>
                  <TableHead>Flow / Target Mode</TableHead>
                  <TableHead>Holding Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scopedProviders.map((p) => {
                  const isCodedRedirect = Number(p.PageTemplate) === 3;
                  return (
                    <TableRow key={p.ProviderId}>
                      <TableCell className="font-bold">{p.ProviderName}</TableCell>
                      <TableCell className="font-mono text-xs">{p.ProviderCode}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold">{p.CategoryName}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {p.SubcategoryName || 'Direct in Category'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isCodedRedirect ? (
                          <div className="flex flex-col gap-1">
                            <Badge className="w-fit bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300">
                              <Smartphone className="mr-1 h-3 w-3" /> Pre-Coded App Page
                            </Badge>
                            {p.ApiEndpoint && (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                Route: {p.ApiEndpoint}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="w-fit border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <Layout className="mr-1 h-3 w-3" /> Dynamic SDUI Form
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.HoldingAccountId}</TableCell>
                      <TableCell>
                        <Badge className={cn(p.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                          {p.Status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit Provider & Target Mode">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/integrations/billers/config/${p.ProviderId}`)}
                          >
                            <Settings2 className="mr-1.5 h-4 w-4" />
                            {isCodedRedirect ? 'Route / Studio' : 'Configure SDUI'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Provider &amp; Related Configuration?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete <strong>&quot;{p.ProviderName}&quot;</strong> and cascade-delete all of its related configuration (Form Fields, Flow Steps, API Configurations, and Display Fields) from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.ProviderId)} className="bg-red-600 hover:bg-red-700">
                                  Delete Provider &amp; Config
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {scopedProviders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No providers registered in this Category / Subcategory yet. Click <strong>Register Provider</strong> above to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProvider ? 'Edit' : 'Register New'} Provider</DialogTitle>
            <DialogDescription>
              Configure provider details, FlexCube holding account, and whether tapping this provider opens a Dynamic SDUI Form or redirects to a Pre-Coded Mobile App Page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.ProviderName}
                  onChange={e => setFormData({ ...formData, ProviderName: e.target.value })}
                  placeholder="e.g. Ethio Telecom Postpaid"
                />
              </div>
              <div className="space-y-2">
                <Label>Provider Unique Code <span className="text-red-500">*</span></Label>
                <Input
                  className="font-mono"
                  value={formData.ProviderCode}
                  onChange={e => setFormData({ ...formData, ProviderCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. ETHIO_TELECOM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.CategoryId}
                  onValueChange={v => setFormData({ ...formData, CategoryId: v, SubcategoryId: 'none' })}
                >
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={formData.SubcategoryId}
                  onValueChange={v => setFormData({ ...formData, SubcategoryId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Direct under Category)</SelectItem>
                    {filteredSubcategoriesForModal.map(s => (
                      <SelectItem key={s.SubcategoryId} value={s.SubcategoryId}>{s.SubcategoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Provider Screen Mode: Dynamic SDUI vs Pre-Coded App Page */}
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Label className="text-sm font-semibold">
                When User Selects This Provider in the Mobile App:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, TargetMode: 'sdui', PageTemplate: '1' }))}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    formData.TargetMode === 'sdui'
                      ? "border-emerald-600 bg-background shadow-sm ring-2 ring-emerald-500/20"
                      : "border-border/70 bg-background/60 hover:bg-background"
                  )}
                >
                  <Layout className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">1. Build Dynamic SDUI Page</p>
                    <p className="text-[11px] text-muted-foreground">
                      Design custom fields, steps, and API mapping in the Visual Form Designer.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      TargetMode: 'coded_page',
                      PageTemplate: '3',
                      ApiEndpoint: prev.ApiEndpoint || '/bills/ethio-telecom',
                    }))
                  }
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    formData.TargetMode === 'coded_page'
                      ? "border-purple-600 bg-background shadow-sm ring-2 ring-purple-500/20"
                      : "border-border/70 bg-background/60 hover:bg-background"
                  )}
                >
                  <Smartphone className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">2. Redirect to Pre-Coded App Page</p>
                    <p className="text-[11px] text-muted-foreground">
                      Skip building a dynamic page and open an already-coded screen in the mobile app.
                    </p>
                  </div>
                </button>
              </div>

              {formData.TargetMode === 'coded_page' && (
                <div className="mt-2 space-y-3 rounded-lg border border-purple-200 bg-background p-3.5 dark:border-purple-900">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Select Pre-Coded Mobile App Screen Preset
                    </Label>
                    <Select
                      value={CODED_APP_PAGES.some(p => p.route === formData.ApiEndpoint) ? formData.ApiEndpoint : 'custom'}
                      onValueChange={(v) => {
                        if (v !== 'custom') setFormData(prev => ({ ...prev, ApiEndpoint: v }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a coded mobile screen..." />
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
                      value={formData.ApiEndpoint}
                      onChange={e => setFormData({ ...formData, ApiEndpoint: e.target.value })}
                      placeholder="/bills/ethio-telecom"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Holding Account ID <span className="text-red-500">*</span></Label>
                <Input
                  className="font-mono"
                  value={formData.HoldingAccountId}
                  onChange={e => setFormData({ ...formData, HoldingAccountId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Rank</Label>
                <Input
                  type="number"
                  value={formData.Rank}
                  onChange={e => setFormData({ ...formData, Rank: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.Status} onValueChange={v => setFormData({ ...formData, Status: v })}>
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
              {editingProvider ? 'Update Provider' : 'Register Provider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
