
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import type { Role } from "@/app/(main)/roles/page";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { db } from "@/lib/db";

function getFormData() {
    const branches = db.prepare("SELECT * FROM branches ORDER BY name ASC").all() as Branch[];
    const departments = db.prepare(`
        SELECT d.*, b.name as branchName 
        FROM departments d
        JOIN branches b ON d.branchId = b.id
        ORDER BY d.name ASC
    `).all() as Department[];
    const roles = db.prepare("SELECT * FROM roles ORDER BY name ASC").all() as Role[];
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
