
import { DepartmentManagementClient } from "@/components/departments/DepartmentManagementClient";
import type { Branch } from "../branches/page";

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


function getDepartments(): Department[] {
  return mockDepartments;
}

function getBranches(): Branch[] {
    return mockBranches;
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
