
import { BranchManagementClient } from "@/components/branches/BranchManagementClient";

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

function getBranches(): Branch[] {
  return mockBranches;
}

export default function BranchesPage() {
  const branches = getBranches();

  return (
    <div className="w-full h-full">
      <BranchManagementClient initialBranches={branches} />
    </div>
  );
}
