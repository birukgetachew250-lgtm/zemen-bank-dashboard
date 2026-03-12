
import { ExceptionalLimitsClient } from "@/components/limits/ExceptionalLimitsClient";
import { executeQuery } from "@/lib/oracle-db";
import { decrypt } from "@/lib/crypto";

export interface ExceptionalLimit {
    id: string;
    cifNumber: string;
    accountNumber: string;
    additionalDailyLimit: number | null;
    additionalWeeklyLimit: number | null;
    additionalMonthlyLimit: number | null;
    isOverride: boolean;
    reason: string | null;
    effectiveFrom: string | null;
    effectiveTo: string | null;
    isActive: boolean;
}

async function getExceptionalLimits(): Promise<ExceptionalLimit[]> {
    try {
        const query = `SELECT "Id", "CIFNumber", "AccountNumber", "AdditionalDailyLimit", "AdditionalWeeklyLimit", "AdditionalMonthlyLimit", "IsOverride", "Reason", "EffectiveFrom", "EffectiveTo", "IsActive" FROM "LIMIT_CHARGE_MODULE"."LimitExceptions" ORDER BY "InsertDate" DESC`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) {
            return [];
        }
        
        return result.rows.map((row: any) => ({
            id: row.Id,
            cifNumber: row.CIFNumber,
            accountNumber: decrypt(row.AccountNumber) || 'Decryption Error',
            additionalDailyLimit: row.AdditionalDailyLimit,
            additionalWeeklyLimit: row.AdditionalWeeklyLimit,
            additionalMonthlyLimit: row.AdditionalMonthlyLimit,
            isOverride: row.IsOverride === 1,
            reason: row.Reason,
            effectiveFrom: row.EffectiveFrom,
            effectiveTo: row.EffectiveTo,
            isActive: row.IsActive === 1,
        }));
    } catch (error) {
        console.error("Failed to fetch exceptional limits:", error);
        return [];
    }
}


export default async function ExceptionalLimitsPage() {
    const initialItems = await getExceptionalLimits();
    return (
        <div className="w-full h-full">
            <ExceptionalLimitsClient initialItems={initialItems} />
        </div>
    );
}
