
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Branch } from "@/app/(main)/branches/page";
import type { Department } from "@/app/(main)/departments/page";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { db } from "@/lib/db";
import type { Role, User } from "@prisma/client";

async function getFormData(id?: string) {
    const branches = await db.branch.findMany({ orderBy: { name: 'asc' } });
    const departments = await db.department.findMany({ orderBy: { name: 'asc' } });
    const roles = await db.role.findMany({ orderBy: { name: 'asc' } });

    if (!id) {
        return { branches, departments, roles, user: null };
    }

    try {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) return { branches, departments, roles, user: null };

        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) return { branches, departments, roles, user: null };
        
        const { password, ...userWithoutPassword } = user;
        
        return { branches, departments, roles, user: userWithoutPassword as any };

    } catch (e) {
        console.error("Failed to fetch user data:", e);
        return { branches, departments, roles, user: null };
    }
}

async function CreateUserPageLoader({ id }: { id?: string }) {
    const { branches, departments, roles, user } = await getFormData(id);
    return (
        <CreateUserForm branches={branches} departments={departments} roles={roles} initialData={user} />
    )
}

export default function CreateOrEditUserPage({ searchParams }: { searchParams: { id?: string }}) {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <div className="w-full h-full">
                <CreateUserPageLoader id={searchParams.id} />
            </div>
        </Suspense>
    );
}
