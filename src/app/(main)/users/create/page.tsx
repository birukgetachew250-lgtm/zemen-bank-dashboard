
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { db } from "@/lib/db";
import type { Role } from "@/app/(main)/roles/page";
import { Prisma } from "@prisma/client";

async function getFormData() {
    // This data is still coming from the local SQLite DB via the legacy connection.
    // In a full microservice architecture, this would call other services.
    const branches: Branch[] = []; // You would fetch this from your structure service
    const departments: Department[] = []; // You would fetch this from your structure service

    // Roles can be fetched from the same DB as users via Prisma
    const roles = await db.role.findMany();

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
