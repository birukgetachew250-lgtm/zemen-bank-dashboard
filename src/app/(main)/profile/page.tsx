
'use client';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Building, Briefcase, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    department: string;
    branch: string | null;
    mfaEnabled: boolean;
}

function ProfilePageClient({ initialUser }: { initialUser: UserProfile }) {
    const { data: session, update } = useSession();
    const [user, setUser] = useState(initialUser);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    const handleMfaToggle = async (enabled: boolean) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/users/toggle-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mfaEnabled: enabled }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update MFA status');
            }
            
            // Update local state
            setUser(prev => ({...prev, mfaEnabled: enabled}));

            // This will trigger a session update, which can be useful if
            // you add MFA status to the session object later.
            await update();

            toast({
                title: 'Security Setting Updated',
                description: `Multi-Factor Authentication has been ${enabled ? 'enabled' : 'disabled'}.`,
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message,
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!user) {
        return <div>Loading profile...</div>
    }

    return (
         <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="/images/avatar.png" alt={user.name} />
                    <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl font-bold font-headline">{user.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 mt-4">
                 <div className="grid md:grid-cols-2 gap-6">
                     <InfoItem icon={<User />} label="Employee ID" value={user.employeeId} />
                     <InfoItem icon={<Shield />} label="Role" value={<Badge variant="secondary">{user.role}</Badge>} />
                     <InfoItem icon={<Briefcase />} label="Department" value={user.department} />
                     <InfoItem icon={<Building />} label="Branch" value={user.branch || 'N/A'} />
                 </div>
                 <Separator />
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
                    <div className="rounded-lg border p-4 flex items-center justify-between">
                         <div className="space-y-0.5">
                            <Label className="text-base flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Multi-Factor Authentication (MFA)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Require a second verification step for enhanced security.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            <Switch
                                checked={user.mfaEnabled}
                                onCheckedChange={handleMfaToggle}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}


async function getUserData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return null;
    }
    
    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (e) {
        console.error("Failed to fetch user profile data:", e);
        return {
            id: '1',
            name: session.user.name || 'Demo User',
            email: session.user.email,
            role: (session.user as any).role || 'Super Admin',
            employeeId: 'admin001',
            department: 'IT Department',
            branch: 'Head Office',
            mfaEnabled: false,
        };
    }
}


export default async function ProfilePage() {
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="w-full h-full flex items-start justify-center pt-8">
            <ProfilePageClient initialUser={user as UserProfile} />
        </div>
    )
}


function InfoItem({ icon, label, value, className }: { icon: React.ReactNode, label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex items-start gap-4", className)}>
            <div className="w-6 h-6 text-muted-foreground mt-1">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
}
