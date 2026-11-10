
import { executeQuery } from '@/lib/oracle-db';
import { ProviderManagement } from '@/components/integrations/billers/ProviderManagement';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProviders() {
    try {
        const query = `
            SELECT p.*, c."CategoryName", s."SubcategoryName" 
            FROM "APP_CONTROL_MODULE"."BillProvider" p 
            JOIN "APP_CONTROL_MODULE"."BillCategory" c ON p."CategoryId" = c."CategoryId"
            LEFT JOIN "APP_CONTROL_MODULE"."BillSubcategory" s ON p."SubcategoryId" = s."SubcategoryId"
            ORDER BY p."Rank" ASC, p."ProviderName" ASC
        `;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        return result.rows || [];
    } catch (error) {
        console.error("Failed to fetch bill providers:", error);
        return [];
    }
}

async function getCategories() {
    try {
        const query = `SELECT * FROM "APP_CONTROL_MODULE"."BillCategory" ORDER BY "Rank" ASC, "CategoryName" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        return result.rows || [];
    } catch (error) {
        console.error("Failed to fetch bill categories:", error);
        return [];
    }
}

async function getSubcategories() {
    try {
        const query = `
            SELECT s.*, c."CategoryName"
            FROM "APP_CONTROL_MODULE"."BillSubcategory" s
            JOIN "APP_CONTROL_MODULE"."BillCategory" c ON s."CategoryId" = c."CategoryId"
            ORDER BY s."Rank" ASC, s."SubcategoryName" ASC
        `;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        return result.rows || [];
    } catch (error) {
        console.error("Failed to fetch bill subcategories:", error);
        return [];
    }
}

export default async function BillProvidersAdminPage() {
    const providers = await getProviders();
    const categories = await getCategories();
    const subcategories = await getSubcategories();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Bill Providers</h1>
                <p className="text-muted-foreground">Manage and configure specific payment providers and their SDUI flows.</p>
            </div>
            
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <ProviderManagement 
                    initialProviders={providers} 
                    categories={categories} 
                    subcategories={subcategories} 
                />
            </Suspense>
        </div>
    );
}
