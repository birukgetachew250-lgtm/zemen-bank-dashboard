

import { db } from "@/lib/db";
import { DepartmentManagementClient } from "@/components/departments/DepartmentManagementClient";
import type { Branch } from "../branches/page";

export interface Department {
  id: string;
  name: string;
  branchId: string;
  createdAt: string;
  branchName?: string;
}

function getDepartments() {
  try {
    return db.prepare(`
      SELECT d.*, b.name as branchName 
      FROM departments d 
      JOIN branches b ON d.branchId = b.id 
      ORDER BY b.name, d.name ASC
    `).all() as Department[];
  } catch (e) {
    console.error("Failed to fetch departments:", e);
    return [];
  }
}

function getBranches() {
    try {
        return db.prepare("SELECT * FROM branches ORDER BY name ASC").all() as Branch[];
    } catch (e) {
        console.error("Failed to fetch branches:", e);
        return [];
    }
}

export default function DepartmentsPage() {
  const departments = getDepartments();
  const branches = getBranches();

  return (
    <div className="w-full h-full">
      <DepartmentManagementClient initialDepartments={departments} branches={branches} />
    </div>
  );
}
