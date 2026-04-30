export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { LimitRuleFormClient } from '@/components/limits/LimitRuleFormClient';
import { executeQuery } from '@/lib/oracle-db';
import type { DropdownItem } from '@/components/charges/ChargeManagementClient';
import type { Interval } from '@/app/(main)/limits/page';

interface Props {
  params: {
    id: string;
  };
}

function formatInputDate(value: any): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

async function getLimitRuleById(id: string) {
  const query = `
    SELECT
      lr."Id" as "id",
      lr."TransactionTypeId" as "transactionTypeId",
      lr."ServiceName" as "serviceName",
      lr."LimitAggregationType" as "limitAggregationType",
      lr."IsGlobal" as "isGlobal",
      lr."Currency" as "currency",
      lr."EffectiveFrom" as "effectiveFrom",
      lr."EffectiveTo" as "effectiveTo",
      lr."PerTransactionLimit" as "perTransactionLimit",
      (
        SELECT LISTAGG(map."CustomerCategoryId", ',') WITHIN GROUP (ORDER BY map."CustomerCategoryId")
        FROM "LIMIT_CHARGE_MODULE"."LimitRuleCustomerCategories" map
        WHERE map."LimitRuleId" = lr."Id"
      ) as "categoryIdsCsv",
      (
        SELECT LISTAGG(svc."ServiceName", ',') WITHIN GROUP (ORDER BY svc."ServiceName")
        FROM "LIMIT_CHARGE_MODULE"."LimitRuleServices" svc
        WHERE svc."LimitRuleId" = lr."Id"
      ) as "serviceNamesCsv"
    FROM "LIMIT_CHARGE_MODULE"."LimitRules" lr
    WHERE lr."Id" = :id
      AND lr."IsActive" = 1
  `;

  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { id });
  return result.rows?.[0] || null;
}

async function getIntervalsByRuleId(ruleId: string) {
  const query = `
    SELECT "PeriodIntervalId" as "periodIntervalId", "LimitAmount" as "limitAmount"
    FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals"
    WHERE "LimitRuleId" = :RuleId
  `;

  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { RuleId: ruleId });
  return result.rows || [];
}

export default async function EditLimitRulePage({ params }: Props) {
  const [rule, dropdownData, intervals, serviceOptions, intervalRows] = await Promise.all([
    getLimitRuleById(params.id),
    getDropdownData(),
    getIntervals(),
    getServiceOptions(),
    getIntervalsByRuleId(params.id),
  ]);

  if (!rule) {
    notFound();
  }

  const initialData = {
    id: rule.id,
    categoryIds: rule.categoryIdsCsv
      ? String(rule.categoryIdsCsv)
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [],
    transactionTypeId: rule.transactionTypeId || null,
    serviceName: rule.serviceName || null,
    limitAggregationType: (rule.limitAggregationType || 'PER_SERVICE') as 'PER_SERVICE' | 'SERVICE_GROUP',
    serviceNames: rule.serviceNamesCsv
      ? String(rule.serviceNamesCsv)
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [],
    isGlobal: rule.isGlobal === 1,
    currency: rule.currency || 'ETB',
    effectiveFrom: formatInputDate(rule.effectiveFrom),
    effectiveTo: formatInputDate(rule.effectiveTo),
    perTransactionLimit: rule.perTransactionLimit != null ? String(rule.perTransactionLimit) : '',
    limits:
      intervalRows.length > 0
        ? intervalRows.map((row: any) => ({ intervalId: row.periodIntervalId, amount: String(row.limitAmount) }))
        : [{ intervalId: '', amount: '' }],
  };

  return (
    <div className="w-full h-full">
      <LimitRuleFormClient
        mode="edit"
        customerCategories={dropdownData.categories}
        transactionTypes={dropdownData.transactionTypes}
        intervals={intervals}
        serviceOptions={serviceOptions}
        initialData={initialData}
      />
    </div>
  );
}
