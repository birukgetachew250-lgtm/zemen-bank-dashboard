
import { UserManagementClient } from "@/components/users/UserManagementClient";
import type { Role, User } from "@prisma/client";
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
  const fallbackUsers = [
      { id: 1, employeeId: 'admin001', name: 'Admin User', email: 'admin@zemen.com', password: 'password', role: 'Super Admin', department: 'IT Department', branch: 'Head Office', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, employeeId: 'ops001', name: 'Operations Lead User', email: 'ops@zemen.com', password: 'password', role: 'Operations Lead', department: 'Branch Operations', branch: 'Bole Branch', createdAt: new Date(), updatedAt: new Date() },
  ];
  const fallbackRoles = [
      { id: 1, name: 'Super Admin', description: 'Full system access.'},
      { id: 2, name: 'Operations Lead', description: 'Manages approvals.'},
      { id: 3, name: 'Support Staff', description: 'Customer support.'},
      { id: 4, name: 'Compliance Officer', description: 'Handles risk and compliance.'},
  ];
  
  let usersData;
  let rolesData;
  
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
  
  const users = usersData.length > 0 ? usersData : fallbackUsers;
  const roles = rolesData.length > 0 ? rolesData : fallbackRoles;

  return (
    <div className="w-full h-full">
      <UserManagementClient initialUsers={users} roles={roles as Role[]} />
    </div>
  );
}
