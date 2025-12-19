
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import type { Role } from "@/app/(main)/roles/page";
import { CreateUserForm } from "@/components/users/CreateUserForm";

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

const mockRoles: Role[] = [
  { id: 1, name: "Admin", permissions: [] },
  { id: 2, name: "Support Lead", permissions: [] },
  { id: 3, name: "Support Staff", permissions: [] },
  { id: 4, name: "Compliance Officer", permissions: [] },
];


function getFormData() {
    return { branches: mockBranches, departments: mockDepartments, roles: mockRoles };
}

export default function CreateUserPage() {
    const { branches, departments, roles } = getFormData();

    return (
        <div className="w-full h-full">
           <CreateUserForm branches={branches} departments={departments} roles={roles} />
        </div>
    );
}
