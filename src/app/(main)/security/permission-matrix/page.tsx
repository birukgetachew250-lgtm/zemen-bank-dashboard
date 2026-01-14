
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { menu, type MenuItem } from "@/lib/menu";
import { PermissionMatrixClient } from "@/components/security/PermissionMatrixClient";
import type { Role } from "@prisma/client";

export interface Permission {
  id: string;
  label: string;
  level: number;
}

export interface RoleWithPermissions extends Role {
    permissions: string[];
}

const flattenMenu = (items: MenuItem[], level = 0, prefix = ''): Permission[] => {
  let permissions: Permission[] = [];
  for (const item of items) {
    const uniqueId = prefix ? `${prefix}>${item.label}` : item.label;
    if (item.label && item.href) {
      permissions.push({ id: item.href, label: item.label, level });
    } else if (item.label && !item.href && item.children) {
        // This is a category header
        permissions.push({ id: uniqueId, label: item.label, level });
    }
    
    if (item.children) {
      permissions = permissions.concat(flattenMenu(item.children, level + 1, uniqueId));
    }
  }
  const uniquePermissions = Array.from(new Map(permissions.map(p => [p.id, p])).values());
  return uniquePermissions;
};

async function getPermissionsData() {
  try {
    const allRoles = await db.role.findMany({
      orderBy: { name: 'asc' },
    });

    const rolesWithPermissions: RoleWithPermissions[] = allRoles.map(role => {
      try {
        const parsed = JSON.parse(role.description);
        return {
          ...role,
          description: parsed.main || '',
          permissions: parsed.permissions || []
        };
      } catch (e) {
        // If parsing fails, it's just a simple description with no permissions
        return { ...role, description: role.description, permissions: [] };
      }
    });

    const allPermissions = flattenMenu(menu);

    return { roles: rolesWithPermissions, resources: allPermissions };
  } catch (error) {
    console.error("Failed to fetch permission data:", error);
    // Return empty state in case of DB error
    return { roles: [], resources: [] };
  }
}

export default async function PermissionMatrixPage() {
    const { roles, resources } = await getPermissionsData();

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <CardTitle>Permissions Matrix</CardTitle>
                        <CardDescription>A detailed grid of all roles and their feature permissions.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <PermissionMatrixClient roles={roles} resources={resources} />
            </CardContent>
        </Card>
    );
}

