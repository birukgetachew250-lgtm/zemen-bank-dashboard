
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { db } from "@/lib/db";

interface Role {
    id: number;
    name: string;
    userCount: number;
    description: string;
}

function getFormData() {
    const branches = (db.prepare('SELECT * FROM branches ORDER BY name ASC').all() as Branch[]) || [];
    const departments = (db.prepare('SELECT d.*, b.name as branchName FROM departments d JOIN branches b ON d.branchId = b.id ORDER BY d.name ASC').all() as Department[]) || [];
    const roles = (db.prepare('SELECT * FROM roles ORDER BY name ASC').all() as Role[]) || [];
    
    // Add default roles if none exist
    if (roles.length === 0) {
        return {
            branches,
            departments,
            roles: [
                { id: 1, name: "Admin", userCount: 0, description: '...' },
                { id: 2, name: "Support Lead", userCount: 0, description: '...' },
                { id: 3, name: "Support Staff", userCount: 0, description: '...' },
                { id: 4, name: "Compliance Officer", userCount: 0, description: '...' },
            ]
        }
    }

    return { branches, departments, roles };
}

export default function CreateUserPage() {
    const { branches, departments, roles } = getFormData();

    return (
        <div className="w-full h-full">
           <CreateUserForm branches={branches} departments={departments} roles={roles} />
        </div>
    );
}
