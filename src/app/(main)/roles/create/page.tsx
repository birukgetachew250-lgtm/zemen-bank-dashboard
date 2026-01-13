
import { CreateRoleForm } from "@/components/users/CreateRoleForm";
import { db } from "@/lib/db";
import { menu, type MenuItem } from "@/lib/menu";
import type { Role } from "@prisma/client";

// This represents the structure we'll use for permissions
export interface Permission {
  id: string;
  label: string;
  level: number;
}

// Flattens the hierarchical menu structure into a flat list of permissions
const flattenMenu = (items: MenuItem[], level = 0): Permission[] => {
  let permissions: Permission[] = [];
  for (const item of items) {
    if (item.href) {
      permissions.push({ id: item.href, label: item.label, level });
    }
    if (item.children) {
      permissions = permissions.concat(flattenMenu(item.children, level + 1));
    }
  }
  return permissions;
};


async function getRoleData(id?: string) {
    const permissions = flattenMenu(menu);

    if (!id) {
        return { permissions, role: null };
    }
    
    try {
        const roleId = parseInt(id, 10);
        if (isNaN(roleId)) return { permissions, role: null };

        const role = await db.role.findUnique({
            where: { id: roleId },
        });

        if (!role) return { permissions, role: null };
        
        // In a real system, permissions would be stored in the DB.
        // For this demo, we'll mock permissions based on the role name.
        const mockPermissions: Record<string, string[]> = {
          "Super Admin": permissions.map(p => p.id),
          "Operations Lead": ['/dashboard', '/customers', '/customers/create', '/customers/link-account', '/customers/unlink-account', '/customers/block', '/customers/unblock', '/customers/request-pin-reset', '/corporates', '/corporates/create', '/corporates/exceptional-limits', '/transactions/all-transactions', '/transactions/p2p-wallet', '/transactions/interoperability', '/transactions/bills-utilities', '/transactions/remittances', '/transactions/limits-overrides', '/transactions/settlements', '/mini-apps', '/mini-apps/create', '/customers/approve-new', '/customers/approve-updated', '/customers/approve-accounts', '/customers/approve-unlink', '/customers/approve-suspension', '/customers/approve-unblocked', '/customers/approve-pin-reset', '/customers/approve-security'],
          "Compliance Officer": ['/dashboard', '/risk/fraud-monitoring', '/risk/aml-kyc', '/risk/nbe-reporting', '/risk/dispute-resolution', '/risk/risk-scoring', '/customers/audit', '/users/audit', '/otp', '/reports/analytics/overview', '/reports/transactions', '/reports/analytics/financial-inclusion', '/reports/analytics/custom-builder', '/reports/analytics/scheduled', '/reports/analytics/export-center'],
          "Support Staff": ['/dashboard', '/customers', '/customers/create', '/customers/link-account', '/customers/unlink-account', '/customers/block', '/customers/unblock', '/customers/request-pin-reset'],
        }

        const roleWithPermissions = {
            ...role,
            permissions: mockPermissions[role.name] || []
        };
        
        return { permissions, role: roleWithPermissions };

    } catch (e) {
        console.error("Failed to fetch role data:", e);
        return { permissions, role: null };
    }
}


export default async function CreateRolePage({ searchParams }: { searchParams: { id?: string }}) {
    const { permissions, role } = await getRoleData(searchParams.id);
    return (
        <div className="w-full h-full">
           <CreateRoleForm permissions={permissions} initialData={role} />
        </div>
    );
}

