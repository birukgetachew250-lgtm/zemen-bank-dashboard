
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
    // Create a more robust unique ID to prevent collisions
    const uniqueId = prefix ? `${prefix}>${item.label}` : item.label;
    
    if (item.href) {
      permissions.push({ id: item.href, label: item.label, level });
    } else if (item.label && item.children) {
      // It's a parent category without a direct link, use its uniqueId
      permissions.push({ id: uniqueId, label: item.label, level });
    }
    
    if (item.children) {
      permissions = permissions.concat(flattenMenu(item.children, level + 1, uniqueId));
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
