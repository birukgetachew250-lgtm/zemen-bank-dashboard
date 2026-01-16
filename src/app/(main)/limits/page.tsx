
import { LimitManagementClient } from "@/components/limits/LimitManagementClient";
import type { LimitRule } from "@/components/limits/LimitManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getLimitRules(): Promise<LimitRule[]> {
  try {
    const query = `SELECT * FROM "LIMIT_CHARGE_MODULE"."LimitRules" WHERE "IsActive" = 1 ORDER BY "CustomerCategory", "TransactionType"`;
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) {
        return [];
    }

    return result.rows.map((row: any) => ({
        id: row.Id,
        category: row.CustomerCategory,
        transactionType: row.TransactionType,
        dailyLimit: row.DailyLimit,
        weeklyLimit: row.WeeklyLimit,
        monthlyLimit: row.MonthlyLimit,
    }));
  } catch (error) {
    console.error("Failed to fetch limit rules:", error);
    return []; // Return empty array on error
  }
}

export default async function LimitsPage() {
    const limitRules = await getLimitRules();

    return (
        <div className="w-full h-full">
            <LimitManagementClient initialLimitRules={limitRules} />
        </div>
    );
}
