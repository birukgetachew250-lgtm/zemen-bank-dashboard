
import { ChargeManagementClient } from "@/components/charges/ChargeManagementClient";
import type { ChargeRule } from "@/components/charges/ChargeManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getChargeRules(): Promise<ChargeRule[]> {
  try {
    const query = `SELECT * FROM "LIMIT_CHARGE_MODULE"."ChargeRules" WHERE "IsActive" = 1 ORDER BY "CustomerCategory", "TransactionType"`;
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) {
        return [];
    }
    
    return result.rows.map((row: any) => ({
      id: row.Id,
      category: row.CustomerCategory,
      transactionType: row.TransactionType,
      chargeType: row.FixedAmount > 0 ? 'Fixed' : 'Percentage',
      value: row.FixedAmount > 0 ? row.FixedAmount : row.Percentage,
    }));
  } catch (error) {
    console.error("Failed to fetch charge rules:", error);
    return [];
  }
}


export default async function TransactionChargesPage() {
    const chargeRules = await getChargeRules();
    
    return (
        <div className="w-full h-full">
            <ChargeManagementClient initialChargeRules={chargeRules} />
        </div>
    );
}
