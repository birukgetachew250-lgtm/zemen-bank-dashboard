
import { UserManagementClient } from "@/components/users/UserManagementClient";
import type { Role } from "@/app/(main)/roles/page";
import { SystemUser } from "@/components/users/UserManagementClient";
import { db } from "@/lib/db";

// Mock roles remain for now, as roles aren't in the DB yet
const mockRoles: Role[] = [
  { id: 1, name: "Admin", userCount: 1, description: '...' },
  { id: 2, name: "Support Lead", userCount: 1, description: '...' },
  { id: 3, name: "Support Staff", userCount: 0, description: '...' },
  { id: 4, name: "Compliance Officer", userCount: 0, description: '...' },
];

function getSystemUsers(): SystemUser[] {
  try {
    const data = db.prepare("SELECT * FROM users ORDER BY name ASC").all();
    return data as SystemUser[];
  } catch (e) {
    console.error("Failed to fetch users from DB:", e);
    return [];
  }
}

function getRoles(): Role[] {
    return mockRoles;
}

export default function UsersPage() {
  const users = getSystemUsers();
  const roles = getRoles();

  return (
    <div className="w-full h-full">
      <UserManagementClient initialUsers={users} roles={roles} />
    </div>
  );
}
