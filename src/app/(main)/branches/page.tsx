
import { db } from "@/lib/db";
import { BranchManagementClient } from "@/components/branches/BranchManagementClient";

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
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

function getDepartments() {
  try {
    return db.prepare("SELECT * FROM departments ORDER BY name ASC").all() as Department[];
  } catch (e) {
    console.error("Failed to fetch departments:", e);
    return [];
  }
}

export default function BranchesAndDepartmentsPage() {
  const branches = getBranches();
  const departments = getDepartments();

  return <BranchManagementClient initialBranches={branches} initialDepartments={departments} />;
}
