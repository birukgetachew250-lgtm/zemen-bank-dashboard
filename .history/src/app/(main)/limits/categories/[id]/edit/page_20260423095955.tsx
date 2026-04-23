export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { CustomerCategoryFormClient } from '@/components/limits/CustomerCategoryFormClient';
import { executeQuery } from '@/lib/oracle-db';

interface Props {
  params: {
    id: string;
  };
}

async function getCategoryById(id: string) {
  const query = `SELECT "Id", "Code", "Name", "Description" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" WHERE "Id" = :id`;
  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, [id]);
  const row = result.rows?.[0];
  if (!row) return null;

  return {
    id: row.Id,
    code: row.Code,
    name: row.Name,
    description: row.Description || '',
  };
}

export default async function EditCustomerCategoryPage({ params }: Props) {
  const item = await getCategoryById(params.id);
  if (!item) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <CustomerCategoryFormClient mode="edit" initialItem={item} />
    </div>
  );
}
