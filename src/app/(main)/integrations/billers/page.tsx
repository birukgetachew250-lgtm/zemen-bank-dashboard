
import { Suspense } from 'react';
import { executeQuery } from '@/lib/oracle-db';
import { BillCategoryList } from '@/components/integrations/billers/BillCategoryList';
import { Loader2 } from 'lucide-react';

async function getBillCategories() {
  try {
    const query = `
      SELECT "CategoryId", "CategoryName", "Description", "LogoUrl", "ColorHex", "Status", "Rank"
      FROM "APP_CONTROL_MODULE"."BillCategory"
      ORDER BY "Rank" ASC
    `;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
    return result.rows || [];
  } catch (error) {
    console.error("Failed to fetch bill categories:", error);
    return [];
  }
}

export default async function BillersPage() {
  const categories = await getBillCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Bill Payment Categories</h1>
        <p className="text-muted-foreground">Manage top-level categories for utility and service payments.</p>
      </div>
      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <BillCategoryList initialCategories={categories} />
      </Suspense>
    </div>
  );
}
