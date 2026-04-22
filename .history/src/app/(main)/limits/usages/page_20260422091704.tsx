export const dynamic = 'force-dynamic';

import {
  CustomerLimitUsagesClient,
  type CustomerLimitUsage,
  type LimitUsageDropdownData,
} from '@/components/limits/CustomerLimitUsagesClient';
import { executeQuery } from '@/lib/oracle-db';

async function getCustomerLimitUsages(): Promise<CustomerLimitUsage[]> {
  try {
    const query = `
      SELECT
        clu."Id" as "id",
        clu."CIFNumber" as "cifNumber",
        clu."CustomerCategoryId" as "customerCategoryId",
        cc."Name" as "customerCategoryName",
        clu."TransactionTypeId" as "transactionTypeId",
        tt."Name" as "transactionTypeName",
        clu."ServiceName" as "serviceName",
        clu."Currency" as "currency",
        clu."DailyPeriodStart" as "dailyPeriodStart",
        clu."DailyPeriodEnd" as "dailyPeriodEnd",
        clu."DailyAmountUsed" as "dailyAmountUsed",
        clu."DailyTransactionCount" as "dailyTransactionCount",
        clu."WeeklyPeriodStart" as "weeklyPeriodStart",
        clu."WeeklyPeriodEnd" as "weeklyPeriodEnd",
        clu."WeeklyAmountUsed" as "weeklyAmountUsed",
        clu."WeeklyTransactionCount" as "weeklyTransactionCount",
        clu."MonthlyPeriodStart" as "monthlyPeriodStart",
        clu."MonthlyPeriodEnd" as "monthlyPeriodEnd",
        clu."MonthlyAmountUsed" as "monthlyAmountUsed",
        clu."MonthlyTransactionCount" as "monthlyTransactionCount",
        clu."AppliedLimitRuleId" as "appliedLimitRuleId",
        clu."AppliedExceptionId" as "appliedExceptionId",
        clu."IsActive" as "isActive",
        clu."LastTransactionDate" as "lastTransactionDate",
        clu."LastDailyReset" as "lastDailyReset",
        clu."LastWeeklyReset" as "lastWeeklyReset",
        clu."LastMonthlyReset" as "lastMonthlyReset"
      FROM "LIMIT_CHARGE_MODULE"."CustomerLimitUsages" clu
      LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON clu."CustomerCategoryId" = cc."Id"
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON clu."TransactionTypeId" = tt."Id"
      ORDER BY clu."UpdateDate" DESC, clu."InsertDate" DESC
    `;

    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    if (!result.rows) return [];

    return result.rows.map((row: any) => ({
      id: row.id,
      cifNumber: row.cifNumber,
      customerCategoryId: row.customerCategoryId,
      customerCategoryName: row.customerCategoryName || null,
      transactionTypeId: row.transactionTypeId,
      transactionTypeName: row.transactionTypeName || null,
      serviceName: row.serviceName,
      currency: row.currency || 'ETB',
      dailyPeriodStart: row.dailyPeriodStart,
      dailyPeriodEnd: row.dailyPeriodEnd,
      dailyAmountUsed: Number(row.dailyAmountUsed || 0),
      dailyTransactionCount: Number(row.dailyTransactionCount || 0),
      weeklyPeriodStart: row.weeklyPeriodStart,
      weeklyPeriodEnd: row.weeklyPeriodEnd,
      weeklyAmountUsed: Number(row.weeklyAmountUsed || 0),
      weeklyTransactionCount: Number(row.weeklyTransactionCount || 0),
      monthlyPeriodStart: row.monthlyPeriodStart,
      monthlyPeriodEnd: row.monthlyPeriodEnd,
      monthlyAmountUsed: Number(row.monthlyAmountUsed || 0),
      monthlyTransactionCount: Number(row.monthlyTransactionCount || 0),
      appliedLimitRuleId: row.appliedLimitRuleId,
      appliedExceptionId: row.appliedExceptionId,
      isActive: row.isActive === 1,
      lastTransactionDate: row.lastTransactionDate,
      lastDailyReset: row.lastDailyReset,
      lastWeeklyReset: row.lastWeeklyReset,
      lastMonthlyReset: row.lastMonthlyReset,
    }));
  } catch (error) {
    console.error('Failed to fetch customer limit usages:', error);
    return [];
  }
}

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
      `SELECT "Id" as "id", "CIFNumber" as "cifNumber" FROM "LIMIT_CHARGE_MODULE"."LimitExceptions" ORDER BY "InsertDate" DESC`
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
  const [initialItems, dropdownData] = await Promise.all([getCustomerLimitUsages(), getDropdownData()]);

  return (
    <div className="w-full h-full">
      <CustomerLimitUsagesClient initialItems={initialItems} dropdownData={dropdownData} />
    </div>
  );
}
