export const dynamic = 'force-dynamic';

import { ChargeRuleFormClient } from '@/components/charges/ChargeRuleFormClient';
import { executeQuery } from '@/lib/oracle-db';

async function getDropdownData() {
  try {
    const categoriesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"'
    );
    const typesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"'
    );

    const customerCategories = categoriesResult.rows.map((row: any) => ({ id: row.Id, name: row.Name })) || [];
    const transactionTypes = typesResult.rows.map((row: any) => ({ id: row.Id, name: row.Name })) || [];

    return { customerCategories, transactionTypes };
  } catch (error) {
    console.error('Failed to fetch dropdowns for charge rule form:', error);
    return { customerCategories: [], transactionTypes: [] };
  }
}

export default async function NewTransactionChargePage() {
  const { customerCategories, transactionTypes } = await getDropdownData();

  return (
    <div className="w-full h-full">
      <ChargeRuleFormClient
        mode="create"
        customerCategories={customerCategories}
        transactionTypes={transactionTypes}
      />
    </div>
  );
}
