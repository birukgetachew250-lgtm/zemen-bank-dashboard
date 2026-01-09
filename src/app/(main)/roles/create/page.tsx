
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Check, X, Eye, VenetianMask, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const permissions = [
    { resource: "Customers", actions: ["view", "create", "edit", "export"] },
    { resource: "Corporates", actions: ["view", "create", "edit", "export"] },
    { resource: "Transactions", actions: ["view", "refund", "flag", "export"] },
    { resource: "Approvals", actions: ["view", "approve", "reject"] },
    { resource: "Risk & Compliance", actions: ["view", "manage_rules", "resolve_disputes"] },
    { resource: "System Monitoring", actions: ["view"] },
    { resource: "Reports & Analytics", actions: ["view", "create_custom", "export"] },
    { resource: "Integrations", actions: ["view", "edit_config"] },
    { resource: "Security & Access", actions: ["view", "manage_roles", "manage_users"] },
    { resource: "Settings", actions: ["view", "edit"] },
];

const actionLabels: Record<string, string> = {
    view: "View",
    create: "Create",
    edit: "Edit",
    export: "Export",
    refund: "Refund",
    flag: "Flag",
    approve: "Approve",
    reject: "Reject",
    manage_rules: "Manage Rules",
    resolve_disputes: "Resolve Disputes",
    edit_config: "Edit Config",
    manage_roles: "Manage Roles",
    manage_users: "Manage Users",
};

export default function CreateRolePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});

  const handleSaveRole = () => {
    if (!roleName) {
      toast({
        variant: "destructive",
        title: "Role Name Required",
        description: "Please enter a name for the role before saving.",
      });
      return;
    }
    toast({
      title: "Role Saved (UI Only)",
      description: `The role "${roleName}" and its permissions have been saved.`,
    });
    router.push('/roles');
  };

  const togglePermission = (resource: string, action: string) => {
    setRolePermissions(prev => ({
        ...prev,
        [resource]: {
            ...prev[resource],
            [action]: !prev[resource]?.[action]
        }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Role</CardTitle>
        <CardDescription>
          Define a name, description, and assign granular permissions for the new role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role-name" className="font-semibold">Role Name</Label>
            <Input 
              id="role-name" 
              placeholder="e.g., Branch Manager" 
              className="mt-2" 
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role-desc" className="font-semibold">Description</Label>
            <Input 
              id="role-desc" 
              placeholder="A brief description of the role's responsibilities" 
              className="mt-2" 
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div>
            <h3 className="text-lg font-semibold mb-4">Permissions Matrix</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Resource</TableHead>
                    {Object.keys(actionLabels).map(action => (
                      <TableHead key={action} className="text-center">{actionLabels[action]}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(({resource, actions}) => (
                    <TableRow key={resource}>
                      <TableCell className="font-medium">{resource}</TableCell>
                       {Object.keys(actionLabels).map(action => (
                          <TableCell key={action} className="text-center">
                            {actions.includes(action) ? (
                              <Checkbox 
                                checked={!!rolePermissions[resource]?.[action]} 
                                onCheckedChange={() => togglePermission(resource, action)}
                              />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                            )}
                          </TableCell>
                       ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/roles')}>Cancel</Button>
        <Button onClick={handleSaveRole}>Save Role</Button>
      </CardFooter>
    </Card>
  );
}
