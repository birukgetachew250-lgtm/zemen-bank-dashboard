
import { BranchManagementClient } from "@/components/branches/BranchManagementClient";
import { db } from "@/lib/db";

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

async function getBranches(): Promise<Branch[]> {
  try {
    const data = await db.branch.findMany({
      orderBy: { name: 'asc' },
    });
    return data.map(b => ({...b, createdAt: b.createdAt.toISOString()}));
  } catch (e) {
    console.error("Failed to fetch branches from DB:", e);
    return [];
  }
}

export default async function BranchesPage() {
  const fallbackBranches: Branch[] = [
      { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa', createdAt: new Date().toISOString() },
      { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa', createdAt: new Date().toISOString() },
      { id: 'br_3', name: 'Arada Branch', location: 'Arada, Addis Ababa', createdAt: new Date().toISOString() },
  ];
  
  let branchesData;
  try {
    branchesData = await getBranches();
  } catch(e) {
    console.error("Branches page DB error, using fallback data.", e);
    branchesData = [];
  }
  
  const branches = branchesData.length > 0 ? branchesData : fallbackBranches;

  return (
    <div className="w-full h-full">
      <BranchManagementClient initialBranches={branches} />
    </div>
  );
}
