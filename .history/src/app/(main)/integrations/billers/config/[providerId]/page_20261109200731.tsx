
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, Code, Layout, ListTodo, FileJson, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { SDUIFieldBuilder } from '@/components/integrations/billers/SDUIFieldBuilder';
import { SDUIFlowDesigner } from '@/components/integrations/billers/SDUIFlowDesigner';
import { SDUIApiConfig } from '@/components/integrations/billers/SDUIApiConfig';
import { SDUIDisplayConfig } from '@/components/integrations/billers/SDUIDisplayConfig';

export default function BillerConfigDashboardPage({ params }: { params: { providerId: string } }) {
    const { providerId } = params;
    const [config, setConfig] = useState<any>(null);
    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch provider basic info
            const pRes = await fetch(`/api/bill-management/providers?id=${providerId}`);
            const pData = await pRes.json();
            // In a real list endpoint this might be an array, but we assume it has our specific provider
            setProvider(pData.find((p: any) => p.ProviderId === providerId));

            // Fetch full config (fields, steps, api, display)
            const cRes = await fetch(`/api/bill-management/providers/${providerId}/config`);
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

    if (loading && !config) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!provider) {
        return (
            <div className="p-8 text-center space-y-4">
                <p>Provider not found.</p>
                <Button asChild variant="outline"><Link href="/integrations/billers/providers">Back to Providers</Link></Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div
                className="relative overflow-hidden rounded-3xl border border-white/10 p-5 md:p-6 text-white shadow-xl"
                style={{ background: 'radial-gradient(80% 140% at 100% 0%, hsl(84 70% 35% / 0.55), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 75% 38% / 0.5), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(220 55% 7%))' }}
            >
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white">
                            <Link href={`/integrations/billers/providers`}><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-300/90">Bill Provider Studio</p>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{provider.ProviderName}</h1>
                            <p className="text-white/60 text-xs uppercase tracking-widest font-mono">{provider.ProviderCode}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchData} className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                        <Button className="rounded-xl bg-white text-slate-900 hover:bg-white/90"><Save className="mr-2 h-4 w-4" /> Save All Changes</Button>
                    </div>
                </div>
            </div>

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
        </div>
    );
}
