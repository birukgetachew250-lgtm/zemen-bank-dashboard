export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { TransactionTypeFormClient } from '@/components/limits/TransactionTypeFormClient';
import { executeQuery } from '@/lib/oracle-db';

interface Props {
  params: {
    id: string;
  };
}

async function getTransactionTypeById(id: string) {
  const query = `SELECT "Id", "Code", "Name", "Description" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" WHERE "Id" = :id`;
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

export default async function EditTransactionTypePage({ params }: Props) {
  const item = await getTransactionTypeById(params.id);
  if (!item) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <TransactionTypeFormClient mode="edit" initialItem={item} />
    </div>
  );
}
