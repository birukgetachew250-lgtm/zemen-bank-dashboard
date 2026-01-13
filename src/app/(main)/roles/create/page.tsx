
import { CreateRoleForm } from "@/components/users/CreateRoleForm";
import { db } from "@/lib/db";
import { menu, type MenuItem } from "@/lib/menu";

export interface Permission {
  id: string;
  label: string;
  level: number;
}

const flattenMenu = (items: MenuItem[], level = 0, prefix = ''): Permission[] => {
  let permissions: Permission[] = [];
  for (const item of items) {
    // Generate a unique ID based on the path from the root.
    // This is more robust than relying on href alone.
    const uniqueId = prefix ? `${prefix}>${item.label}` : item.label;
    
    // Add the current item
    if (item.label) {
      // Use the href as the permission identifier if it exists, as this is what's used for routing checks.
      // The uniqueId is just for React's key prop.
      permissions.push({ id: item.href || uniqueId, label: item.label, level });
    }
    
    // Recurse into children
    if (item.children) {
      permissions = permissions.concat(flattenMenu(item.children, level + 1, uniqueId));
    }
  }
  // Remove duplicates that might arise from parent items having the same href as a child
  const uniquePermissions = Array.from(new Map(permissions.map(p => [p.id, p])).values());
  return uniquePermissions;
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
        
        let mainDescription = role.description;
        let rolePermissions: string[] = [];

        try {
            const descObj = JSON.parse(role.description);
            mainDescription = descObj.main || '';
            rolePermissions = descObj.permissions || [];
        } catch (e) {
            // It's just a plain string, do nothing
        }
        
        const roleWithPermissions = {
            ...role,
            description: mainDescription,
            permissions: rolePermissions
        };
        
        return { permissions, role: roleWithPermissions };

    } catch (e) {
        console.error("Failed to fetch role data:", e);
        return { permissions, role: null };
    }
}


export default async function CreateRolePage({ searchParams }: { searchParams: { id?: string }}) {
    const { id } = searchParams;
    const { permissions, role } = await getRoleData(id);
    return (
        <div className="w-full h-full">
           <CreateRoleForm permissions={permissions} initialData={role} />
        </div>
    );
}
