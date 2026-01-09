
import { DepartmentManagementClient } from "@/components/departments/DepartmentManagementClient";
import type { Branch } from "../branches/page";
import { db } from "@/lib/db";
import config from "@/lib/config";

export interface Department {
  id: string;
  name: string;
  branchId: string;
  createdAt: string;
  branchName?: string;
}

const mockBranches: Branch[] = [
    { id: 'br_1', name: 'Bole Branch', location: 'Bole, Addis Ababa', createdAt: new Date().toISOString() },
    { id: 'br_2', name: 'Head Office', location: 'HQ, Addis Ababa', createdAt: new Date().toISOString() },
    { id: 'br_3', name: 'Arada Branch', location: 'Arada, Addis Ababa', createdAt: new Date().toISOString() },
];

const mockDepartments: Department[] = [
    { id: 'dept_1', name: 'IT Department', branchId: 'br_2', createdAt: new Date().toISOString(), branchName: 'Head Office' },
    { id: 'dept_2', name: 'Branch Operations', branchId: 'br_1', createdAt: new Date().toISOString(), branchName: 'Bole Branch' },
    { id: 'dept_3', name: 'Human Resources', branchId: 'br_2', createdAt: new Date().toISOString(), branchName: 'Head Office' },
    { id: 'dept_4', name: 'Customer Service', branchId: 'br_3', createdAt: new Date().toISOString(), branchName: 'Arada Branch' },
];

async function getDepartments(): Promise<Department[]> {
  try {
    let data;
    if (config.db.isProduction) {
        data = await db.prepare('SELECT d."id", d."name", d."branchId", d."createdAt", b."name" as "branchName" FROM "USER_MODULE"."departments" d JOIN "USER_MODULE"."branches" b ON d."branchId" = b."id" ORDER BY d."name" ASC').all();
    } else {
        data = db.prepare("SELECT d.*, b.name as branchName FROM departments d JOIN branches b ON d.branchId = b.id ORDER BY d.name ASC").all();
    }
    return data as Department[];
  } catch(e) {
    console.error("Failed to fetch departments from DB:", e);
    return [];
  }
}

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

export default async function DepartmentsPage() {
  const departmentsData = await getDepartments();
  const branchesData = await getBranches();

  const departments = departmentsData.length > 0 ? departmentsData : mockDepartments;
  const branches = branchesData.length > 0 ? branchesData : mockBranches;

  return (
    <div className="w-full h-full">
      <DepartmentManagementClient initialDepartments={departments} branches={branches} />
    </div>
  );
}
