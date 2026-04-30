
export const dynamic = 'force-dynamic';

import { LimitManagementClient } from "@/components/limits/LimitManagementClient";
import type { LimitRule } from "@/components/limits/LimitManagementClient";
import type { DropdownItem } from "@/components/charges/ChargeManagementClient";
import { executeQuery } from "@/lib/oracle-db";

export interface Interval {
    id: string;
    name: string;
}

async function getLimitRules(): Promise<LimitRule[]> {
  try {
    const query = `
      SELECT
        lr."Id" as "id",
        lr."CustomerCategoryId" as "customerCategoryId",
                (
                    SELECT LISTAGG(map."CustomerCategoryId", ',') WITHIN GROUP (ORDER BY map."CustomerCategoryId")
                    FROM "LIMIT_CHARGE_MODULE"."LimitRuleCustomerCategories" map
                    WHERE map."LimitRuleId" = lr."Id"
                ) as "categoryIdsCsv",
                (
                    SELECT LISTAGG(cat."Name", ', ') WITHIN GROUP (ORDER BY cat."Name")
                    FROM "LIMIT_CHARGE_MODULE"."LimitRuleCustomerCategories" map
                    JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cat ON map."CustomerCategoryId" = cat."Id"
                    WHERE map."LimitRuleId" = lr."Id"
                ) as "categories",
        lr."TransactionTypeId" as "transactionTypeId",
        cc."Name" as "category",
        tt."Name" as "transactionType",
        lr."ServiceName" as "serviceName",
                lr."LimitAggregationType" as "limitAggregationType",
                (
                    SELECT LISTAGG(svc."ServiceName", ',') WITHIN GROUP (ORDER BY svc."ServiceName")
                    FROM "LIMIT_CHARGE_MODULE"."LimitRuleServices" svc
                    WHERE svc."LimitRuleId" = lr."Id"
                ) as "serviceNamesCsv",
                (
                    SELECT LISTAGG(svc."ServiceName", ', ') WITHIN GROUP (ORDER BY svc."ServiceName")
                    FROM "LIMIT_CHARGE_MODULE"."LimitRuleServices" svc
                    WHERE svc."LimitRuleId" = lr."Id"
                ) as "serviceGroupDisplay",
        lr."IsGlobal" as "isGlobal",
        lr."Currency" as "currency",
        lr."EffectiveFrom" as "effectiveFrom",
        lr."EffectiveTo" as "effectiveTo",
                lr."PerTransactionLimit" as "perTransactionLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Daily') as "dailyLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Weekly') as "weeklyLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Monthly') as "monthlyLimit"
      FROM "LIMIT_CHARGE_MODULE"."LimitRules" lr
      LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr."CustomerCategoryId" = cc."Id"
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr."TransactionTypeId" = tt."Id"
      WHERE lr."IsActive" = 1
      ORDER BY cc."Name", tt."Name"`;
      
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) return [];

    return result.rows.map((row: any) => ({
        id: row.id,
        customerCategoryId: row.customerCategoryId,
                customerCategoryIds: row.categoryIdsCsv
                    ? String(row.categoryIdsCsv)
                            .split(',')
                            .map((v: string) => v.trim())
                            .filter(Boolean)
                    : row.customerCategoryId
                        ? [String(row.customerCategoryId)]
                        : [],
        transactionTypeId: row.transactionTypeId,
                category: row.categories || row.category || 'All Categories',
        transactionType: row.transactionType || 'All Types',
        serviceName: row.serviceName,
                limitAggregationType: row.limitAggregationType || 'PER_SERVICE',
                serviceNames: row.serviceNamesCsv
                    ? String(row.serviceNamesCsv)
                            .split(',')
                            .map((v: string) => v.trim())
                            .filter(Boolean)
                    : [],
                serviceGroupDisplay: row.serviceGroupDisplay || row.serviceName || '-',
        isGlobal: row.isGlobal === 1,
        currency: row.currency || 'ETB',
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
                perTransactionLimit: row.perTransactionLimit ?? null,
        dailyLimit: row.dailyLimit || 0,
        weeklyLimit: row.weeklyLimit || 0,
        monthlyLimit: row.monthlyLimit || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch limit rules:", error);
    return [];
  }
}

async function getDropdownData(): Promise<{ categories: DropdownItem[], transactionTypes: DropdownItem[] }> {
    try {
        const categoriesResult: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"`);
        const typesResult: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"`);
        
        const categories = categoriesResult.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
        const transactionTypes = typesResult.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
        
        return { categories, transactionTypes };
    } catch (error) {
        console.error("Failed to fetch dropdown data for limits:", error);
        return { categories: [], transactionTypes: [] };
    }
}

async function getIntervals(): Promise<Interval[]> {
    try {
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."PeriodIntervals" ORDER BY "Days"`);
        return result.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
    } catch (error) {
        console.error("Failed to fetch intervals for limits:", error);
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
                console.error("Failed to fetch service options for limits:", error);
                return [
                    { id: 'TELEBIRR', name: 'TELEBIRR' },
                    { id: 'MPESA', name: 'MPESA' },
                    { id: 'OWN_TRANSFER', name: 'OWN_TRANSFER' },
                ];
        }
}


export default async function LimitsPage() {
        const [limitRules] = await Promise.all([
            getLimitRules(),
        ]);

    return (
        <div className="w-full h-full">
            <LimitManagementClient 
                initialLimitRules={limitRules}
            />
        </div>
    );
}
