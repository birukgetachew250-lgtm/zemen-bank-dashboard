
import { DepartmentManagementClient } from "@/components/departments/DepartmentManagementClient";
import type { Branch } from "../branches/page";
import { db } from "@/lib/db";

export interface Department {
  id: string;
  name: string;
  branchId: string;
  createdAt: string;
  branchName?: string;
}

async function getDepartments(): Promise<Department[]> {
  try {
    const data = await db.department.findMany({
        include: { branch: { select: { name: true } } },
        orderBy: { name: 'asc' }
    });
    return data.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        branchName: d.branch.name
    }));
  } catch(e) {
    console.error("Failed to fetch departments from DB:", e);
    return [];
  }
}

async function getBranches(): Promise<Branch[]> {
    try {
        const data = await db.branch.findMany({
            orderBy: { name: 'asc' }
        });
        return data.map(b => ({...b, createdAt: b.createdAt.toISOString()}));
    } catch (e) {
        console.error("Failed to fetch branches from DB:", e);
        return [];
    }
}

export default async function DepartmentsPage() {
    const fallbackBranches: Branch[] = [
        { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa', createdAt: new Date().toISOString() },
        { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa', createdAt: new Date().toISOString() },
        { id: 'br_3', name: 'Arada Branch', location: 'Arada, Addis Ababa', createdAt: new Date().toISOString() },
    ];
    const fallbackDepartments: Department[] = [
        { id: 'dept_1', name: 'IT Department', branchId: 'br_2', createdAt: new Date().toISOString(), branchName: 'Head Office' },
        { id: 'dept_2', name: 'Branch Operations', branchId: 'br_1', createdAt: new Date().toISOString(), branchName: 'Bole Branch' },
    ];

    let departmentsData;
    let branchesData;

    try {
        departmentsData = await getDepartments();
    } catch (e) {
        console.error("Departments page DB error (departments), using fallback data.", e);
        departmentsData = [];
    }

    try {
        branchesData = await getBranches();
    } catch (e) {
        console.error("Departments page DB error (branches), using fallback data.", e);
        branchesData = [];
    }


  const departments = departmentsData.length > 0 ? departmentsData : fallbackDepartments;
  const branches = branchesData.length > 0 ? branchesData : fallbackBranches;

  return (
    <div className="w-full h-full">
      <DepartmentManagementClient initialDepartments={departments} branches={branches} />
    </div>
  );
}
