
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
    { id: 'usr_1', name: 'Admin User', email: 'admin@zemenbank.com', role: 'Super Admin', mfaStatus: 'Enrolled', method: 'Email', lastVerified: '2026-01-15T10:00:00Z' },
    { id: 'usr_2', name: 'Abebe Bikila', email: 'abebe.b@zemenbank.com', role: 'Compliance Officer', mfaStatus: 'Enrolled', method: 'Email', lastVerified: '2026-01-15T09:30:00Z' },
    { id: 'usr_3', name: 'Tirunesh Dibaba', email: 'tirunesh.d@zemenbank.com', role: 'Operations Lead', mfaStatus: 'Not Enrolled', method: 'N/A', lastVerified: null },
    { id: 'usr_4', name: 'Haile Gebrselassie', email: 'haile.g@zemenbank.com', role: 'Support Staff', mfaStatus: 'Pending', method: 'Email', lastVerified: null },
];

const statusConfig = {
    Enrolled: { Icon: CheckCircle, color: 'text-green-500' },
    'Not Enrolled': { Icon: AlertTriangle, color: 'text-red-500' },
    Pending: { Icon: AlertTriangle, color: 'text-yellow-500' },
};

export default function MfaPoliciesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [policies, setPolicies] = useState({
        mfaRequired: true,
        allowedMfaMethods: ['email'],
        sessionTimeout: 30,
        concurrentSessions: 1,
    });
    const { toast } = useToast();

    useEffect(() => {
        const fetchPolicies = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/security/policies');
                if (!res.ok) throw new Error("Failed to fetch policies.");
                const data = await res.json();
                setPolicies(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPolicies();
    }, [toast]);
    
    const handlePolicyChange = (key: string, value: any) => {
        setPolicies(prev => ({...prev, [key]: value}));
    };

    const handleSave = async () => {
        setIsSaving(true);
         try {
            const res = await fetch('/api/security/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policies)
            });
            if (!res.ok) {
                 const error = await res.json();
                 throw new Error(error.message || 'Failed to save policies');
            }
            toast({ title: 'Success', description: 'Security policies have been updated.'});
         } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
         } finally {
            setIsSaving(false);
         }
    };


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Global Security Policies</CardTitle>
                <CardDescription>Manage mandatory authentication and session policies for all admin users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
                ) : (
                <>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <Label className="font-semibold">MFA Requirement</Label>
                            <p className="text-sm text-muted-foreground mb-2">Force MFA for all users.</p>
                            <Switch checked={policies.mfaRequired} onCheckedChange={(c) => handlePolicyChange('mfaRequired', c)} />
                        </div>
                        <div>
                            <Label className="font-semibold">Allowed MFA Methods</Label>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center justify-between"><Label className="font-normal">Email</Label><Switch checked={policies.allowedMfaMethods.includes('email')} readOnly disabled /></div>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <Label className="font-semibold" htmlFor="session-timeout">Session Timeout (inactivity)</Label>
                            <p className="text-sm text-muted-foreground">{policies.sessionTimeout} minutes</p>
                            <Slider
                                id="session-timeout"
                                min={5}
                                max={60}
                                step={5}
                                value={[policies.sessionTimeout]}
                                onValueChange={(value) => handlePolicyChange('sessionTimeout', value[0])}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label className="font-semibold">Concurrent Sessions</Label>
                            <Select value={String(policies.concurrentSessions)} onValueChange={(value) => handlePolicyChange('concurrentSessions', Number(value))}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Allow 1 session</SelectItem>
                                    <SelectItem value="3">Allow up to 3 sessions</SelectItem>
                                    <SelectItem value="0">Unlimited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </>
                )}
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
                <Button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Global Policies
                </Button>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>User MFA Status</CardTitle>
                <CardDescription>Monitor and manage MFA enrollment for individual users.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Admin User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>MFA Status</TableHead>
                                <TableHead>Enrolled Method</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map(user => {
                                const { Icon, color } = statusConfig[user.mfaStatus as keyof typeof statusConfig];
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${color}`} />
                                                <span>{user.mfaStatus}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.method}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">
                                                <KeyRound className="mr-2" />
                                                Reset MFA
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
