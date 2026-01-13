
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

async function getFormData() {
    const branches = await db.branch.findMany({ orderBy: { name: 'asc' } });
    const departments = await db.department.findMany({ orderBy: { name: 'asc' } });
    const roles = await db.role.findMany({ orderBy: { name: 'asc' } });

    // Add default roles if none exist
    if (roles.length === 0) {
        return {
            branches,
            departments,
            roles: [
                { id: 1, name: "Admin", description: '...' },
                { id: 2, name: "Support Lead", description: '...' },
                { id: 3, name: "Support Staff", description: '...' },
                { id: 4, name: "Compliance Officer", description: '...' },
            ]
        }
    }

    return { branches, departments, roles };
}

export default async function CreateUserPage() {
    const { branches, departments, roles } = await getFormData();

    return (
        <div className="w-full h-full">
           <CreateUserForm branches={branches} departments={departments} roles={roles} />
        </div>
    );
}
