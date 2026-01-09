
import { UserManagementClient } from "@/components/users/UserManagementClient";
import type { Role } from "@/app/(main)/roles/page";
import { db } from "@/lib/db";

async function getSystemUsers() {
  try {
    const data = await db.user.findMany({
        orderBy: { name: 'asc' }
    });
    return data;
  } catch (e) {
    console.error("Failed to fetch users from DB:", e);
    return [];
  }
}

async function getRoles(): Promise<Role[]> {
    try {
        const roles = await db.role.findMany();
        return roles;
    } catch(e) {
        console.error("Failed to fetch roles from DB:", e);
        return [];
    }
}

export default async function UsersPage() {
  const users = await getSystemUsers();
  const roles = await getRoles();

  return (
    <div className="w-full h-full">
      <UserManagementClient initialUsers={users} roles={roles} />
    </div>
  );
}
