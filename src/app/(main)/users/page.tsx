
import { UserManagementClient } from "@/components/users/UserManagementClient";
import type { Role } from "@/app/(main)/roles/page";
import { SystemUser } from "@/components/users/UserManagementClient";

const mockUsers: SystemUser[] = [
    {
        id: 'user_ck_admin_001',
        employeeId: '0001',
        name: 'Admin User',
        email: 'admin@zemen.com',
        role: 'Admin',
        branch: 'Head Office',
        department: 'IT Department',
    },
    {
        id: 'user_ck_support_001',
        employeeId: '0002',
        name: 'Support Lead',
        email: 'support.lead@zemen.com',
        role: 'Support Lead',
        branch: 'Head Office',
        department: 'IT Department',
    }
];

const mockRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    permissions: ["manage-users", "manage-roles", "view-reports", "manage-settings", "approve-all"],
  },
  {
    id: 2,
    name: "Support Lead",
    permissions: ["approve-pin-reset", "approve-new-device", "view-customer-audit", "manage-tickets"],
  },
  {
    id: 3,
    name: "Support Staff",
    permissions: ["view-customers", "handle-tickets", "request-pin-reset"],
  },
  {
    id: 4,
    name: "Compliance Officer",
    permissions: ["view-reports", "view-audit-trails", "flag-transaction"],
  },
];


function getSystemUsers(): SystemUser[] {
  return mockUsers;
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
