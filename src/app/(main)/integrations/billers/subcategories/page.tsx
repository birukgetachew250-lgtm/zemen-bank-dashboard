
import { executeQuery } from '@/lib/oracle-db';
import { SubcategoryManagement } from '@/components/integrations/billers/SubcategoryManagement';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function getSubcategories() {
    try {
        const query = `
            SELECT s.*, c."CategoryName" 
            FROM "APP_CONTROL_MODULE"."BillSubcategory" s 
            JOIN "APP_CONTROL_MODULE"."BillCategory" c ON s."CategoryId" = c."CategoryId"
            ORDER BY s."Rank" ASC
        `;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        return result.rows || [];
    } catch (error) {
        console.error("Failed to fetch bill subcategories:", error);
        return [];
    }
}

async function getCategories() {
    const query = `SELECT "CategoryId", "CategoryName" FROM "APP_CONTROL_MODULE"."BillCategory" ORDER BY "CategoryName" ASC`;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
    return result.rows || [];
}

export default async function BillSubcategoriesAdminPage() {
    const subcategories = await getSubcategories();
    const categories = await getCategories();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Bill Subcategories</h1>
                <p className="text-muted-foreground">Manage secondary grouping and mini-app integrations.</p>
            </div>
            
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <SubcategoryManagement initialSubcategories={subcategories} categories={categories} />
            </Suspense>
        </div>
    );
}
