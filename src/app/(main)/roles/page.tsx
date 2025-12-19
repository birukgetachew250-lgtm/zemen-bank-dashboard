
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { menu, type MenuItem } from "@/lib/menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface Role {
    id: number;
    name: string;
    permissions: string[];
}


const initialRoles: Role[] = [
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

const permissionLabels: { [key: string]: string } = {
    "manage-users": "Manage Users",
    "manage-roles": "Manage Roles",
    "view-reports": "View Reports",
    "manage-settings": "Manage Settings",
    "approve-all": "Approve All Requests",
    "approve-pin-reset": "Approve PIN Reset",
    "approve-new-device": "Approve New Device",
    "view-customer-audit": "View Customer Audit",
    "manage-tickets": "Manage Tickets",
    "view-customers": "View Customers",
    "handle-tickets": "Handle Tickets",
    "request-pin-reset": "Request PIN Reset",
    "view-audit-trails": "View Audit Trails",
    "flag-transaction": "Flag Transaction",
}

const getMenuPermissions = (menuItems: MenuItem[]): string[] => {
  let permissions: string[] = [];
  menuItems.forEach(item => {
    if (item.href) {
      permissions.push(item.href);
    }
    if (item.children) {
      permissions = [...permissions, ...getMenuPermissions(item.children)];
    }
  });
  return permissions;
};


export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  const openAddDialog = () => {
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissions([]);
    setDialogOpen(true);
  };
  
  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    // For now, we use a placeholder for permissions.
    // In a real scenario, you'd map role.permissions to menu hrefs
    const allMenuHrefs = getMenuPermissions(menu);
    const rolePermissions = role.permissions.map(p => `/${p.replace(/-/g, '/')}`); // This is a guess
    setSelectedPermissions(allMenuHrefs.slice(0, 5)); // Placeholder
    setDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleName) {
      toast({
        variant: "destructive",
        title: "Missing Role Name",
        description: "Please enter a name for the role.",
      });
      return;
    }
    // This is UI-only for now as requested
    toast({
      title: editingRole ? "Role Updated (UI Only)" : "Role Added (UI Only)",
      description: `Role "${roleName}" has been saved with ${selectedPermissions.length} permissions.`,
    });
    setDialogOpen(false);
  };

  const handlePermissionChange = (permissionHref: string, isChecked: boolean) => {
    setSelectedPermissions(prev => 
      isChecked ? [...prev, permissionHref] : prev.filter(p => p !== permissionHref)
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>Define user roles and their access levels across the application.</CardDescription>
          </div>
          <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-semibold w-1/4">{role.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 7).map((permission) => (
                          <Badge key={permission} variant="secondary" className="font-normal">
                            {permissionLabels[permission] || permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 7 && <Badge variant="outline">+{role.permissions.length - 7} more</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(role)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit' : 'Add'} Role</DialogTitle>
            <DialogDescription>
              Set a name for the role and select the menu items it can access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-6 py-4">
             <div className="md:col-span-1 space-y-4">
                <div>
                  <Label htmlFor="role-name" className="text-right">Role Name</Label>
                  <Input 
                    id="role-name" 
                    value={roleName} 
                    onChange={(e) => setRoleName(e.target.value)} 
                    placeholder="e.g., Branch Manager"
                    className="mt-2"
                  />
                </div>
             </div>
             <div className="md:col-span-2">
                <Label>Menu Permissions</Label>
                <ScrollArea className="h-72 mt-2 rounded-md border p-4">
                  <div className="space-y-4">
                    {menu.map((item) => (
                      <div key={item.label}>
                         <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={item.href || item.label}
                            checked={selectedPermissions.includes(item.href || "")}
                            onCheckedChange={(checked) => handlePermissionChange(item.href || "", !!checked)}
                            disabled={!item.href}
                          />
                          <Label htmlFor={item.href || item.label} className="font-semibold">{item.label}</Label>
                        </div>
                        {item.children && (
                          <div className="pl-6 pt-2 space-y-2">
                            {item.children.map(child => (
                               <div key={child.label} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={child.href}
                                  checked={selectedPermissions.includes(child.href)}
                                  onCheckedChange={(checked) => handlePermissionChange(child.href, !!checked)}
                                />
                                <Label htmlFor={child.href} className="font-normal">{child.label}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
             </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveRole}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
