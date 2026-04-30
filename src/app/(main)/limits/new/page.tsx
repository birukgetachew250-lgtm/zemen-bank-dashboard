export const dynamic = 'force-dynamic';

import { LimitRuleFormClient } from '@/components/limits/LimitRuleFormClient';
import { executeQuery } from '@/lib/oracle-db';
import type { DropdownItem } from '@/components/charges/ChargeManagementClient';
import type { Interval } from '@/app/(main)/limits/page';

async function getDropdownData(): Promise<{ categories: DropdownItem[]; transactionTypes: DropdownItem[] }> {
  try {
    const categoriesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"'
    );
    const typesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"'
    );

    const categories = categoriesResult.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
    const transactionTypes = typesResult.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];

    return { categories, transactionTypes };
  } catch (error) {
    console.error('Failed to fetch dropdown data for limits:', error);
    return { categories: [], transactionTypes: [] };
  }
}

async function getIntervals(): Promise<Interval[]> {
  try {
    const result: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."PeriodIntervals" ORDER BY "Days"'
    );
    return result.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
  } catch (error) {
    console.error('Failed to fetch intervals for limits:', error);
    return [];
  }
}

async function getServiceOptions(): Promise<DropdownItem[]> {
  try {
    const result: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      `
        SELECT DISTINCT "ServiceName" as "Name"
        FROM "LIMIT_CHARGE_MODULE"."CustomerTransactions"
        WHERE "ServiceName" IS NOT NULL
        UNION
        SELECT DISTINCT "ServiceName" as "Name"
        FROM "LIMIT_CHARGE_MODULE"."LimitRules"
        WHERE "ServiceName" IS NOT NULL
        UNION
        SELECT DISTINCT "ServiceName" as "Name"
        FROM "LIMIT_CHARGE_MODULE"."LimitRuleServices"
        WHERE "ServiceName" IS NOT NULL
        ORDER BY "Name"
      `
    );

    const fromDb = result.rows?.map((r: any) => ({ id: r.Name, name: r.Name })) || [];
    const defaults = ['TELEBIRR', 'MPESA', 'OWN_TRANSFER'].map((name) => ({ id: name, name }));
    const all = [...fromDb, ...defaults];
    const seen = new Set<string>();

    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch (error) {
    console.error('Failed to fetch service options for limits:', error);
    return [
      { id: 'TELEBIRR', name: 'TELEBIRR' },
      { id: 'MPESA', name: 'MPESA' },
      { id: 'OWN_TRANSFER', name: 'OWN_TRANSFER' },
    ];
  }
}

export default async function NewLimitRulePage() {
  const [dropdownData, intervals, serviceOptions] = await Promise.all([
    getDropdownData(),
    getIntervals(),
    getServiceOptions(),
  ]);

  return (
    <div className="w-full h-full">
      <LimitRuleFormClient
        mode="create"
        customerCategories={dropdownData.categories}
        transactionTypes={dropdownData.transactionTypes}
        intervals={intervals}
        serviceOptions={serviceOptions}
      />
    </div>
  );
}
