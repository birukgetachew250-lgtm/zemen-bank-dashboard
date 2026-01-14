
import { IPSBankManagementClient } from "@/components/integrations/ips/IPSBankManagementClient";
import type { IPSBank } from "@/components/integrations/ips/IPSBankManagementClient";
import { db } from "@/lib/db";

async function getBanks(): Promise<IPSBank[]> {
  try {
    const banks = await db.iPSBank.findMany({
      orderBy: { rank: 'asc' }
    });
    return banks.map(b => ({
        ...b,
        bankLogo: b.bankLogo || `https://picsum.photos/seed/${b.id}/40/40`,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
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
