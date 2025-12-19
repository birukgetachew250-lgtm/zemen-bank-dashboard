
import { db } from "@/lib/db";
import { BranchManagementClient } from "@/components/branches/BranchManagementClient";

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

function getBranches(): Branch[] {
  try {
    const result = db.prepare("SELECT * FROM branches ORDER BY name ASC").all();
    // Ensure we always return an array, even if the result is null or undefined.
    return (result as Branch[]) || [];
  } catch (e) {
    console.error("Failed to fetch branches:", e);
    return [];
  }
}

export default function BranchesPage() {
  const branches = getBranches();

  return (
    <div className="w-full h-full">
      <BranchManagementClient initialBranches={branches} />
    </div>
  );
}
