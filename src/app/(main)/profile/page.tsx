
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Building, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
        // Fallback for demo mode if DB fails but session exists
        return {
            id: '1',
            name: session.user.name || 'Demo User',
            email: session.user.email,
            role: (session.user as any).role || 'Super Admin',
            employeeId: 'admin001',
            department: 'IT Department',
            branch: 'Head Office',
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
                </CardContent>
            </Card>
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
