export const dynamic = 'force-dynamic';

import {
  CustomerLimitUsagesClient,
  type LimitUsageDropdownData,
} from '@/components/limits/CustomerLimitUsagesClient';
import { executeQuery } from '@/lib/oracle-db';

async function getDropdownData(): Promise<LimitUsageDropdownData> {
  try {
    const categoriesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `SELECT "Id" as "id", "Name" as "name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"`
    );

    const typesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `SELECT "Id" as "id", "Name" as "name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"`
    );

    const rulesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `
        SELECT
          lr."Id" as "id",
          COALESCE(cc."Name", 'All Categories') || ' / ' || COALESCE(tt."Name", 'All Types') || ' / ' || NVL(lr."ServiceName", '-') as "name"
        FROM "LIMIT_CHARGE_MODULE"."LimitRules" lr
        LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr."CustomerCategoryId" = cc."Id"
        LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr."TransactionTypeId" = tt."Id"
        WHERE lr."IsActive" = 1
        ORDER BY lr."InsertDate" DESC
      `
    );

    const exceptionsResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `SELECT "Id" as "id", "CIFNumber" as "cifNumber" FROM "LIMIT_CHARGE_MODULE"."LimitExceptions" ORDER BY "InsertDate" DESC FETCH FIRST 200 ROWS ONLY`
    );

    return {
      customerCategories: categoriesResult.rows || [],
      transactionTypes: typesResult.rows || [],
      limitRules: rulesResult.rows || [],
      limitExceptions: (exceptionsResult.rows || []).map((row: any) => ({
        id: row.id,
        name: row.cifNumber ? `${row.cifNumber} (${row.id})` : row.id,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch usages dropdown data:', error);
    return {
      customerCategories: [],
      transactionTypes: [],
      limitRules: [],
      limitExceptions: [],
    };
  }
}

export default async function LimitUsagesPage() {
  const dropdownData = await getDropdownData();

  return (
    <div className="w-full h-full">
      <CustomerLimitUsagesClient initialItems={[]} dropdownData={dropdownData} />
    </div>
  );
}
