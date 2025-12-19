
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
import { menu, type MenuItem } from '@/lib/menu';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const accessLevels = ['Read', 'Write', 'Approve', 'Delete'];

function PermissionRow({ item }: { item: MenuItem }) {
  return (
    <div>
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
        <Label htmlFor={`menu-${item.label}`} className="font-semibold text-base flex items-center gap-2">
          <item.icon className="h-5 w-5 text-muted-foreground" />
          {item.label}
        </Label>
        <div className="flex items-center gap-6">
          {accessLevels.map(level => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox id={`perm-${item.label}-${level}`} />
              <Label htmlFor={`perm-${item.label}-${level}`} className="font-normal text-sm">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {item.children && (
        <div className="pl-10 mt-2 space-y-2">
          {item.children.map(child => (
            <div key={child.label} className="flex items-center justify-between py-2 pl-4 border-l-2">
              <Label htmlFor={`menu-${child.label}`} className="font-medium text-sm">
                {child.label}
              </Label>
              <div className="flex items-center gap-6">
                {accessLevels.map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox id={`perm-${child.label}-${level}`} />
                     <Label htmlFor={`perm-${child.label}-${level}`} className="font-normal text-sm">
                        {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateRolePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roleName, setRoleName] = useState('');

  const handleSaveRole = () => {
    if (!roleName) {
      toast({
        variant: "destructive",
        title: "Role Name Required",
        description: "Please enter a name for the role before saving.",
      });
      return;
    }
    // UI-only save confirmation
    toast({
      title: "Role Saved (UI Only)",
      description: `The role "${roleName}" and its permissions have been saved.`,
    });
    router.push('/roles');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Role</CardTitle>
        <CardDescription>
          Define a name for the new role and assign its access permissions below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="role-name" className="text-lg font-semibold">Role Name</Label>
          <Input 
            id="role-name" 
            placeholder="e.g., Branch Manager" 
            className="mt-2 max-w-sm" 
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        <Separator />

        <div>
            <h3 className="text-lg font-semibold mb-4">Set Permissions</h3>
            <div className="space-y-4">
                {menu.map((item) => (
                    <PermissionRow key={item.label} item={item} />
                ))}
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
