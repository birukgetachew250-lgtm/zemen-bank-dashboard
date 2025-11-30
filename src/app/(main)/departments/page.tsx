
import { db } from "@/lib/db";
import { DepartmentManagementClient } from "@/components/departments/DepartmentManagementClient";

export interface Department {
  id: string;
  name: string;
  createdAt: string;
}

function getDepartments() {
  try {
    return db.prepare("SELECT * FROM departments ORDER BY name ASC").all() as Department[];
  } catch (e) {
    console.error("Failed to fetch departments:", e);
    return [];
  }
}

export default function DepartmentsPage() {
  const departments = getDepartments();

  return <DepartmentManagementClient initialDepartments={departments} />;
}
