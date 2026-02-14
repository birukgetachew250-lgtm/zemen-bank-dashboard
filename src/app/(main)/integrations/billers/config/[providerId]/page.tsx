
import { Suspense } from 'react';
import { executeQuery } from '@/lib/oracle-db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, Play, Code, Layout, ListTodo, FileJson } from 'lucide-react';
import Link from 'next/link';

async function getProviderDetails(id: string) {
    const query = `
        SELECT p.*, c."CategoryName"
        FROM "APP_CONTROL_MODULE"."BillProvider" p
        JOIN "APP_CONTROL_MODULE"."BillCategory" c ON p."CategoryId" = c."CategoryId"
        WHERE p."ProviderId" = :id
    `;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });
    return result.rows?.[0];
}

export default async function BillerConfigDashboardPage({ params }: { params: { providerId: string } }) {
    const provider = await getProviderDetails(params.providerId);

    if (!provider) {
        return <div className="p-8 text-center">Provider not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/integrations/billers/${provider.CategoryId}`}><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">{provider.ProviderName}</h1>
                        <p className="text-muted-foreground">Configuration Dashboard for {provider.CategoryName}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Play className="mr-2 h-4 w-4" /> Test Flow</Button>
                    <Button><Save className="mr-2 h-4 w-4" /> Save All Changes</Button>
                </div>
            </div>

            <Tabs defaultValue="api" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="api"><Code className="mr-2 h-4 w-4" /> API Config</TabsTrigger>
                    <TabsTrigger value="form"><Layout className="mr-2 h-4 w-4" /> UI Form</TabsTrigger>
                    <TabsTrigger value="flow"><ListTodo className="mr-2 h-4 w-4" /> Steps</TabsTrigger>
                    <TabsTrigger value="display"><FileJson className="mr-2 h-4 w-4" /> Display</TabsTrigger>
                </TabsList>

                <TabsContent value="api" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration API Endpoints</CardTitle>
                            <CardDescription>Configure HTTP endpoints for lookup, validation, and payment execution.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">API Configuration Editor Component will be rendered here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="form" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Field Definitions</CardTitle>
                            <CardDescription>Define the input fields users see when initiating a payment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">Form Field Builder Component will be rendered here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="flow" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Flow Steps</CardTitle>
                            <CardDescription>Define the sequence of screens and transitions for this provider.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">Flow Sequence Editor Component will be rendered here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="display" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Output Display Mapping</CardTitle>
                            <CardDescription>Control which fields are shown on the confirmation and receipt screens.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">Display Field Mapper Component will be rendered here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
