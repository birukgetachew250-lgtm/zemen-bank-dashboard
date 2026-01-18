
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
        cc."Name" as "category",
        tt."Name" as "transactionType",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Daily') as "dailyLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Weekly') as "weeklyLimit",
        (SELECT li."LimitAmount" FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals" li JOIN "LIMIT_CHARGE_MODULE"."PeriodIntervals" pi ON li."PeriodIntervalId" = pi."Id" WHERE li."LimitRuleId" = lr."Id" AND pi."Name" = 'Monthly') as "monthlyLimit"
      FROM "LIMIT_CHARGE_MODULE"."LimitRules" lr
      JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON lr."CustomerCategoryId" = cc."Id"
      JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON lr."TransactionTypeId" = tt."Id"
      WHERE lr."IsActive" = 1
      ORDER BY cc."Name", tt."Name"`;
      
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) return [];

    return result.rows.map((row: any) => ({
        id: row.id,
        category: row.category,
        transactionType: row.transactionType,
        dailyLimit: row.dailyLimit || 0,
        weeklyLimit: row.weeklyLimit || 0,
        monthlyLimit: row.monthlyLimit || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch limit rules:", error);
    return []; // Return empty array on error
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


export default async function LimitsPage() {
    const limitRules = await getLimitRules();
    const { categories, transactionTypes } = await getDropdownData();
    const intervals = await getIntervals();

    return (
        <div className="w-full h-full">
            <LimitManagementClient 
                initialLimitRules={limitRules}
                customerCategories={categories}
                transactionTypes={transactionTypes}
                intervals={intervals}
            />
        </div>
    );
}
