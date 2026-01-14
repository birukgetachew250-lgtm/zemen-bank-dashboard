
'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Permission, RoleWithPermissions } from "@/app/(main)/security/permission-matrix/page";

interface PermissionMatrixClientProps {
    roles: RoleWithPermissions[];
    resources: Permission[];
}

export function PermissionMatrixClient({ roles, resources }: PermissionMatrixClientProps) {
    const allRoleNames = roles.map(r => r.name);
    const [role1, setRole1] = useState(allRoleNames.length > 1 ? allRoleNames[1] : allRoleNames[0] || '');
    const [role2, setRole2] = useState(allRoleNames.length > 2 ? allRoleNames[2] : allRoleNames[1] || '');
    const [compareMode, setCompareMode] = useState(false);

    const rolesToDisplay = compareMode ? roles.filter(r => r.name === role1 || r.name === role2) : roles;
    
    // Create a map for quick permission lookup
    const rolePermissionsMap = new Map(roles.map(r => [r.name, new Set(r.permissions)]));

    return (
        <>
            <div className="flex justify-end items-center gap-4 mb-4">
                <Button variant={compareMode ? "secondary" : "outline"} onClick={() => setCompareMode(!compareMode)}>
                    {compareMode ? "Exit Compare Mode" : "Compare Roles"}
                </Button>
                {compareMode && (
                    <>
                        <Select value={role1} onValueChange={setRole1}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{allRoleNames.map(r => <SelectItem key={`r1-${r}`} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        <span className="text-muted-foreground">vs.</span>
                        <Select value={role2} onValueChange={setRole2}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{allRoleNames.map(r => <SelectItem key={`r2-${r}`} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                    </>
                )}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px] font-semibold">Feature / Page</TableHead>
                        {rolesToDisplay.map(role => (
                            <TableHead key={role.id} className="text-center font-semibold">{role.name}</TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.map(resource => {
                            const permissions1 = rolePermissionsMap.get(role1);
                            const permissions2 = rolePermissionsMap.get(role2);
                            const isDiff = compareMode && permissions1 && permissions2 && permissions1.has(resource.id) !== permissions2.has(resource.id);

                            return (
                                <TableRow key={resource.id}>
                                    <TableCell 
                                        style={{ paddingLeft: `${1 + resource.level * 1.5}rem` }} 
                                        className={cn("font-medium", resource.level === 0 && "text-foreground font-bold")}
                                    >
                                        {resource.label}
                                    </TableCell>
                                    {rolesToDisplay.map(role => {
                                        const hasAccess = rolePermissionsMap.get(role.name)?.has(resource.id) ?? false;
                                        return (
                                            <TableCell key={`${role.id}-${resource.id}`} className={cn("text-center", isDiff && "bg-yellow-100/50 dark:bg-yellow-900/20")}>
                                                {hasAccess ? 
                                                    <Check className="h-5 w-5 text-green-500 mx-auto" /> : 
                                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                                }
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
