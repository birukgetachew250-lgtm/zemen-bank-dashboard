
import { Suspense } from 'react';
import { executeQuery } from '@/lib/oracle-db';
import { BillProviderList } from '@/components/integrations/billers/BillProviderList';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getCategory(id: string) {
    const query = `SELECT "CategoryName" FROM "APP_CONTROL_MODULE"."BillCategory" WHERE "CategoryId" = :id`;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });
    return result.rows?.[0];
}

async function getProviders(categoryId: string) {
  try {
    const query = `
      SELECT "ProviderId", "ProviderName", "ProviderCode", "Status", "Rank", "HoldingAccountId"
      FROM "APP_CONTROL_MODULE"."BillProvider"
      WHERE "CategoryId" = :categoryId
      ORDER BY "Rank" ASC
    `;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { categoryId });
    return result.rows || [];
  } catch (error) {
    console.error("Failed to fetch bill providers:", error);
    return [];
  }
}

export default async function CategoryProvidersPage({ params }: { params: { categoryId: string } }) {
  const category = await getCategory(params.categoryId);
  const providers = await getProviders(params.categoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/integrations/billers"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                {category?.CategoryName || 'Providers'}
            </h1>
            <p className="text-muted-foreground">Manage specific payment providers within this category.</p>
        </div>
      </div>
      
      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <BillProviderList initialProviders={providers} categoryId={params.categoryId} />
      </Suspense>
    </div>
  );
}
