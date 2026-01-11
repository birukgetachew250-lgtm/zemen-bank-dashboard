
import { db } from "@/lib/db";
import { CorporateClientPage } from "@/components/corporates/CorporateClientPage";

interface Corporate {
  id: string;
  name: string;
  industry: string;
  status: string;
  internet_banking_status: string;
  logo_url: string;
}

async function getCorporates(): Promise<Corporate[]> {
  try {
    const data = await db.corporate.findMany({
        orderBy: { name: 'asc' }
    });
    return data;
  } catch (e) {
    console.error("Failed to fetch corporates from DB:", e);
    return [];
  }
}

const fallbackCorporates = [
    { id: "corp_1", name: "Dangote Cement", industry: "Manufacturing", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/dangote/40/40" },
    { id: "corp_2", name: "MTN Nigeria", industry: "Telecommunications", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/mtn/40/40" },
    { id: "corp_3", name: "Zenith Bank", industry: "Finance", status: "Inactive", internet_banking_status: "Disabled", logo_url: "https://picsum.photos/seed/zenith/40/40" },
    { id: "corp_4_new", name: "Jumia Group", industry: "E-commerce", status: "Active", internet_banking_status: "Pending", logo_url: "https://picsum.photos/seed/jumia/40/40" },
];

export default async function CorporatesPage() {
    let corporatesData: Corporate[];
    try {
        corporatesData = await getCorporates();
    } catch(e) {
        console.error("Corporates page DB error, using fallback data", e);
        corporatesData = [];
    }
    
    const corporates = corporatesData.length > 0 ? corporatesData : fallbackCorporates;
    return (
      <div className="w-full h-full">
        <CorporateClientPage corporates={corporates} />
      </div>
    );
}
