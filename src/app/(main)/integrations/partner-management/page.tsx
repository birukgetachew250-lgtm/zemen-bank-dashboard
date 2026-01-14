
import { PartnerManagementClient } from "@/components/integrations/PartnerManagementClient";
import type { Partner } from "@/components/integrations/PartnerManagementClient";
import { db } from "@/lib/db";

async function getPartners(): Promise<Partner[]> {
  try {
    const partners = await db.partner.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return partners.map(p => ({
        ...p,
        logoUrl: p.logoUrl || `https://picsum.photos/seed/${p.id}/40/40`,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error("Failed to fetch partners:", e);
    return [];
  }
}

export default async function PartnerManagementPage() {
  const partners = await getPartners();

  return (
    <div className="w-full h-full">
      <PartnerManagementClient initialPartners={partners} />
    </div>
  );
}
