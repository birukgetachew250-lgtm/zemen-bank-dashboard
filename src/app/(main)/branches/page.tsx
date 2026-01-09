
import { BranchManagementClient } from "@/components/branches/BranchManagementClient";
import { db } from "@/lib/db";
import config from "@/lib/config";

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

const mockBranches: Branch[] = [
    { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa', createdAt: new Date().toISOString() },
    { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa', createdAt: new Date().toISOString() },
    { id: 'br_3', name: 'Arada Branch', location: 'Arada, Addis Ababa', createdAt: new Date().toISOString() },
];

async function getBranches(): Promise<Branch[]> {
  try {
    let data;
    if (config.db.isProduction) {
        data = await db.prepare('SELECT "id", "name", "location", "createdAt" FROM "USER_MODULE"."branches" ORDER BY "name" ASC').all();
    } else {
        data = db.prepare("SELECT id, name, location, createdAt FROM branches ORDER BY name ASC").all();
    }
    return data as Branch[];
  } catch (e) {
    console.error("Failed to fetch branches from DB:", e);
    return [];
  }
}

export default async function BranchesPage() {
  const branchesData = await getBranches();
  const branches = branchesData.length > 0 ? branchesData : mockBranches;

  return (
    <div className="w-full h-full">
      <BranchManagementClient initialBranches={branches} />
    </div>
  );
}
