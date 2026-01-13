
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
import { type Permission } from '@/app/(main)/roles/create/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CreateRoleFormProps {
    permissions: Permission[];
    initialData?: {
        id: number;
        name: string;
        description: string;
        permissions: string[];
    } | null;
}

export function CreateRoleForm({ permissions, initialData }: CreateRoleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [roleName, setRoleName] = useState(initialData?.name || '');
  const [roleDescription, setRoleDescription] = useState(initialData?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>(
    initialData?.permissions.reduce((acc, p) => ({ ...acc, [p]: true }), {}) || {}
  );
  
  const isEditing = !!initialData;

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
      title: `Role ${isEditing ? 'Updated' : 'Saved'} (UI Only)`,
      description: `The role "${roleName}" and its permissions have been saved.`,
    });
    router.push('/roles');
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => ({
        ...prev,
        [permissionId]: !prev[permissionId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Role' : 'Create New Role'}</CardTitle>
        <CardDescription>
          {isEditing ? `Editing permissions for the "${initialData?.name}" role.` : 'Define a name, description, and assign granular permissions for the new role.'}
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
            <div className="rounded-md border max-h-[50vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page / Feature</TableHead>
                    <TableHead className="text-center">Has Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell style={{ paddingLeft: `${1 + p.level * 1.5}rem` }} className="font-medium">
                        {p.label}
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox 
                            checked={!!selectedPermissions[p.id]} 
                            onCheckedChange={() => togglePermission(p.id)}
                        />
                      </TableCell>
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

