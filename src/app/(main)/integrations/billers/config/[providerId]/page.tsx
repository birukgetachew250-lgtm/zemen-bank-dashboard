
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/integrations/billers/providers`}><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">{provider.ProviderName}</h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono">{provider.ProviderCode}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchData}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                    <Button><Save className="mr-2 h-4 w-4" /> Save All Changes</Button>
                </div>
            </div>

            <Tabs defaultValue="fields" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="fields"><Layout className="mr-2 h-4 w-4" /> Form Fields</TabsTrigger>
                    <TabsTrigger value="steps"><ListTodo className="mr-2 h-4 w-4" /> Flow Steps</TabsTrigger>
                    <TabsTrigger value="api"><Code className="mr-2 h-4 w-4" /> API Config</TabsTrigger>
                    <TabsTrigger value="display"><FileJson className="mr-2 h-4 w-4" /> Display</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="mt-6">
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
