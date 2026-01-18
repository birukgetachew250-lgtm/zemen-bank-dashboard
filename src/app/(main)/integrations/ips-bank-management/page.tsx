
import { IPSBankManagementClient } from "@/components/integrations/ips/IPSBankManagementClient";
import type { IPSBank } from "@/components/integrations/ips/IPSBankManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getBanks(): Promise<IPSBank[]> {
  try {
    const query = `SELECT "Id", "BankName", "BankCode", "ReconciliationAccount", "BankLogo", "Status", "Rank", "CreatedAt", "UpdatedAt" FROM "APP_CONTROL_MODULE"."IPSBank" ORDER BY "Rank" ASC`;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
    
    if (!result.rows) {
        return [];
    }

    return result.rows.map((b: any) => ({
        id: b.Id,
        bankName: b.BankName,
        bankCode: b.BankCode,
        reconciliationAccount: b.ReconciliationAccount,
        bankLogo: b.BankLogo || `https://picsum.photos/seed/${b.Id}/40/40`,
        status: b.Status,
        rank: b.Rank,
        createdAt: new Date(b.CreatedAt).toISOString(),
        updatedAt: new Date(b.UpdatedAt).toISOString(),
    }));
  } catch (e) {
    console.error("Failed to fetch IPS banks:", e);
    return [];
  }
}

export default async function IPSBankManagementPage() {
  const banks = await getBanks();

  return (
    <div className="w-full h-full">
      <IPSBankManagementClient initialBanks={banks} />
    </div>
  );
}
