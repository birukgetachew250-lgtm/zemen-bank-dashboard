
import { ExceptionalLimitsClient } from "@/components/limits/ExceptionalLimitsClient";
import { executeQuery } from "@/lib/oracle-db";
import { decrypt } from "@/lib/crypto";

export interface ExceptionalLimit {
    id: string;
    accountNumber: string;
    additionalDailyLimit: number | null;
    additionalWeeklyLimit: number | null;
    additionalMonthlyLimit: number | null;
    reason: string | null;
    isActive: boolean;
}

async function getExceptionalLimits(): Promise<ExceptionalLimit[]> {
    try {
        const query = `SELECT "Id", "EncryptedAccountNumber", "AdditionalDailyLimit", "AdditionalWeeklyLimit", "AdditionalMonthlyLimit", "Reason", "IsActive" FROM "LIMIT_CHARGE_MODULE"."LimitExceptions" ORDER BY "InsertDate" DESC`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        
        if (!result.rows) {
            return [];
        }
        
        return result.rows.map((row: any) => ({
            id: row.Id,
            accountNumber: decrypt(row.EncryptedAccountNumber) || 'Decryption Error',
            additionalDailyLimit: row.AdditionalDailyLimit,
            additionalWeeklyLimit: row.AdditionalWeeklyLimit,
            additionalMonthlyLimit: row.AdditionalMonthlyLimit,
            reason: row.Reason,
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
