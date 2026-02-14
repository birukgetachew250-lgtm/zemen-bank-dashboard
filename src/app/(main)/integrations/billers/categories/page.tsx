
import { executeQuery } from '@/lib/oracle-db';
import { CategoryManagement } from '@/components/integrations/billers/CategoryManagement';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function getCategories() {
    try {
        const query = `SELECT * FROM "APP_CONTROL_MODULE"."BillCategory" ORDER BY "Rank" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        return result.rows || [];
    } catch (error) {
        console.error("Failed to fetch bill categories:", error);
        return [];
    }
}

export default async function BillCategoriesAdminPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Bill Categories</h1>
                <p className="text-muted-foreground">Manage top-level grouping for utility and service billers.</p>
            </div>
            
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <CategoryManagement initialCategories={categories} />
            </Suspense>
        </div>
    );
}
