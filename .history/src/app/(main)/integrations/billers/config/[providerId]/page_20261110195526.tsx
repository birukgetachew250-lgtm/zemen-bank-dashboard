'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Loader2,
    Save,
    Code,
    Layout,
    ListTodo,
    FileJson,
    RefreshCw,
    Smartphone,
    CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { SDUIFieldBuilder } from '@/components/integrations/billers/SDUIFieldBuilder';
import { SDUIFlowDesigner } from '@/components/integrations/billers/SDUIFlowDesigner';
import { SDUIApiConfig } from '@/components/integrations/billers/SDUIApiConfig';
import { SDUIDisplayConfig } from '@/components/integrations/billers/SDUIDisplayConfig';
import { cn } from '@/lib/utils';

export default function BillerConfigDashboardPage({ params }: { params: { providerId: string } }) {
    const { providerId } = params;
    const [config, setConfig] = useState<any>(null);
    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingMode, setSavingMode] = useState(false);
    const [targetMode, setTargetMode] = useState<'sdui' | 'coded_page'>('sdui');
    const [codedRoute, setCodedRoute] = useState<string>('');
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const ts = Date.now();
            const fetchOpts: RequestInit = {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
            };

            let pRes = await fetch(`/api/bill-management/providers?id=${providerId}&t=${ts}`, fetchOpts);
            let pData = await pRes.json();
            let found = Array.isArray(pData) ? pData.find((p: any) => p.ProviderId === providerId) : null;

            // If not found in BillProvider, check if this is a Direct Subcategory ID and auto-initialize its container
            if (!found && providerId.startsWith('subcat-')) {
                const initRes = await fetch('/api/bill-management/subcategories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'ensure-direct-provider', SubcategoryId: providerId }),
                });
                if (initRes.ok) {
                    pRes = await fetch(`/api/bill-management/providers?id=${providerId}&t=${Date.now()}`, fetchOpts);
                    pData = await pRes.json();
                    found = Array.isArray(pData) ? pData.find((p: any) => p.ProviderId === providerId) : null;
                }
            }

            setProvider(found);
            if (found) {
                const isCoded = Number(found.PageTemplate) === 3;
                setTargetMode(isCoded ? 'coded_page' : 'sdui');
                setCodedRoute(found.ApiEndpoint || '');
            }

            // Fetch full config (fields, steps, api, display)
            const cRes = await fetch(`/api/bill-management/providers/${providerId}/config?t=${ts}`, fetchOpts);
            const cData = await cRes.json();
            setConfig(cData);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load configuration.' });
        } finally {
            setLoading(false);
        }
    }, [providerId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveModeAndRoute = async (newMode: 'sdui' | 'coded_page', routeValue?: string) => {
        if (!provider) return;
        const routeToSave = routeValue !== undefined ? routeValue : codedRoute;
        if (newMode === 'coded_page' && !routeToSave.trim()) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select or enter a target mobile app route.' });
            return;
        }
        setSavingMode(true);
        try {
            const res = await fetch('/api/bill-management/providers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ProviderId: provider.ProviderId,
                    PageTemplate: newMode === 'coded_page' ? 3 : 1,
                    ApiEndpoint: newMode === 'coded_page' ? routeToSave : provider.ApiEndpoint,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            setTargetMode(newMode);
            toast({
                title: 'Navigation Mode Saved',
                description:
                    newMode === 'coded_page'
                        ? `Configured to redirect to coded app route "${routeToSave}".`
                        : 'Configured to use the Dynamic SDUI Form Designer.',
            });
            await fetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setSavingMode(false);
        }
    };

    if (loading && !config) {
        return <div className="flex h-full w-full items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!provider) {
        return (
            <div className="p-8 text-center space-y-4">
                <p>Provider not found.</p>
                <Button asChild variant="outline"><Link href="/integrations/billers/providers">Back to Providers</Link></Button>
            </div>
        );
    }

    const backHref = provider.CategoryId
        ? `/integrations/billers/providers?categoryId=${provider.CategoryId}${provider.SubcategoryId ? `&subcategoryId=${provider.SubcategoryId}` : ''}`
        : '/integrations/billers/providers';

    return (
        <div className="space-y-5">
            <div
                className="relative overflow-hidden rounded-3xl border border-white/10 p-5 md:p-6 text-white shadow-xl"
                style={{ background: 'radial-gradient(80% 140% at 100% 0%, hsl(84 70% 35% / 0.55), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 75% 38% / 0.5), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(220 55% 7%))' }}
            >
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white">
                            <Link href={backHref}><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-300/90">Bill Provider Studio</p>
                                <Badge className={cn(
                                    "text-[10px]",
                                    targetMode === 'coded_page'
                                        ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                                        : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                                )}>
                                    {targetMode === 'coded_page' ? 'Pre-Coded App Page Redirect' : 'Dynamic SDUI Studio'}
                                </Badge>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{provider.ProviderName}</h1>
                            <p className="text-white/60 text-xs uppercase tracking-widest font-mono">
                                {provider.ProviderCode} · {provider.CategoryName}{provider.SubcategoryName ? ` / ${provider.SubcategoryName}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
                            <button
                                type="button"
                                onClick={() => setTargetMode('sdui')}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                    targetMode === 'sdui' ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:text-white"
                                )}
                            >
                                <Layout className="h-3.5 w-3.5" /> Dynamic SDUI Builder
                            </button>
                            <button
                                type="button"
                                onClick={() => setTargetMode('coded_page')}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                    targetMode === 'coded_page' ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:text-white"
                                )}
                            >
                                <Smartphone className="h-3.5 w-3.5" /> Redirect to Coded Page
                            </button>
                        </div>
                        <Button variant="outline" onClick={fetchData} className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {targetMode === 'coded_page' ? (
                <Card className="border-purple-200 dark:border-purple-900 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Smartphone className="h-5 w-5" />
                            <CardTitle>Redirect to Pre-Coded Mobile App Page</CardTitle>
                        </div>
                        <CardDescription>
                            Instead of building a dynamic SDUI form, tapping <strong>{provider.ProviderName}</strong> in the mobile app will redirect the user directly to an already-coded screen in the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label>Target Mobile App Route / Screen Key <span className="text-red-500">*</span></Label>
                            <Input
                                className="font-mono"
                                value={codedRoute}
                                onChange={(e) => setCodedRoute(e.target.value)}
                                placeholder="e.g. /bills/ethio-telecom or EthioTelecomScreen"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the exact route or screen key coded in the mobile application.
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                                <span>
                                    Current active target route: <code className="font-mono font-bold text-foreground">{codedRoute || 'Not set'}</code>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSaveModeAndRoute('sdui')}
                                    disabled={savingMode}
                                >
                                    Switch Back to Dynamic SDUI Builder
                                </Button>
                                <Button
                                    onClick={() => handleSaveModeAndRoute('coded_page', codedRoute)}
                                    disabled={savingMode}
                                >
                                    {savingMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Coded Page Redirect
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {Number(provider.PageTemplate) === 3 && (
                        <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs dark:border-amber-800 dark:bg-amber-950/40">
                            <span>
                                This provider is currently saved as a <strong>Coded App Page Redirect ({provider.ApiEndpoint})</strong>. Click &quot;Activate Dynamic SDUI Mode&quot; to switch it to Dynamic SDUI.
                            </span>
                            <Button size="sm" onClick={() => handleSaveModeAndRoute('sdui')} disabled={savingMode}>
                                Activate Dynamic SDUI Mode
                            </Button>
                        </div>
                    )}
                    <Tabs defaultValue="fields" className="w-full">
                        <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl border border-border/70 bg-card/80 p-1.5 lg:w-auto">
                            <TabsTrigger value="fields" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Layout className="mr-2 h-4 w-4" /> Form Designer</TabsTrigger>
                            <TabsTrigger value="steps" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ListTodo className="mr-2 h-4 w-4" /> Flow Steps</TabsTrigger>
                            <TabsTrigger value="api" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Code className="mr-2 h-4 w-4" /> API Config</TabsTrigger>
                            <TabsTrigger value="display" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileJson className="mr-2 h-4 w-4" /> Display</TabsTrigger>
                        </TabsList>

                        <TabsContent value="fields" className="mt-5">
                            <SDUIFieldBuilder providerId={providerId} initialFields={config?.fields || []} />
                        </TabsContent>

                        <TabsContent value="steps" className="mt-6">
                            <SDUIFlowDesigner providerId={providerId} initialSteps={config?.steps || []} />
                        </TabsContent>

                        <TabsContent value="api" className="mt-6">
                            <SDUIApiConfig providerId={providerId} initialConfigs={config?.api || []} />
                        </TabsContent>

                        <TabsContent value="display" className="mt-6">
                            <SDUIDisplayConfig providerId={providerId} initialFields={config?.display || []} />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
