
import { UserManagementClient } from "@/components/users/UserManagementClient";
import type { Role, User } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

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
  const fallbackRoles = [
      { id: 1, name: 'Super Admin', description: 'Full system access.'},
      { id: 2, name: 'Operations Lead', description: 'Manages approvals.'},
      { id: 3, name: 'Support Staff', description: 'Customer support.'},
      { id: 4, name: 'Compliance Officer', description: 'Handles risk and compliance.'},
  ];
  
  let usersData: any[] = [];
  let rolesData: any[] = [];
  
  try {
    usersData = await getSystemUsers();
  } catch (e) {
    console.error("Users page DB error (users), using fallback data", e);
    usersData = [];
  }
  
  try {
    rolesData = await getRoles();
  } catch (e) {
    console.error("Users page DB error (roles), using fallback data", e);
    rolesData = [];
  }
  
  const users = usersData;
  const roles = rolesData.length > 0 ? rolesData : fallbackRoles;

  return (
    <div className="w-full h-full">
      <UserManagementClient initialUsers={users} roles={roles as Role[]} />
    </div>
  );
}
