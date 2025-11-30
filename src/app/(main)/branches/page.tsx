
import { db } from "@/lib/db";
import { BranchManagementClient } from "@/components/branches/BranchManagementClient";

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

function getBranches() {
  try {
    return db.prepare("SELECT * FROM branches ORDER BY name ASC").all() as Branch[];
  } catch (e) {
    console.error("Failed to fetch branches:", e);
    return [];
  }
}

export default function BranchesPage() {
  const branches = getBranches();

  return <BranchManagementClient initialBranches={branches} />;
}
