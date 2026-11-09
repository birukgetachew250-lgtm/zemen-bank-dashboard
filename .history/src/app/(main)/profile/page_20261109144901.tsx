'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Shield,
  Building,
  Briefcase,
  Lock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMfa, setIsSavingMfa] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(
            `/api/users/by-email/${encodeURIComponent(session.user.email)}`
          );
          if (!res.ok) {
            throw new Error('Failed to fetch user details');
          }
          const userData = await res.json();
          setUser(userData);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      setIsLoading(true);
    }
  }, [status, session, router, toast]);

  const handleMfaToggle = async (enabled: boolean) => {
    setIsSavingMfa(true);
    try {
      const response = await fetch('/api/users/toggle-mfa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaEnabled: enabled }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update MFA status');
      }

      setUser((prev) => (prev ? { ...prev, mfaEnabled: enabled } : null));
      await update({ mfaEnabled: enabled });

      toast({
        title: 'Security Setting Updated',
        description: `Multi-Factor Authentication has been ${
          enabled ? 'enabled' : 'disabled'
        }.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsSavingMfa(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-start justify-center pt-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="mb-4 h-24 w-24">
            <AvatarImage src="/images/avatar.png" alt={user.name} />
            <AvatarFallback>
              {user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-3xl font-bold">
            {user.name}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 grid gap-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <InfoItem icon={<User />} label="Employee ID" value={user.employeeId} />
            <InfoItem
              icon={<Shield />}
              label="Role"
              value={<Badge variant="secondary">{user.role}</Badge>}
            />
            <InfoItem icon={<Briefcase />} label="Department" value={user.department} />
            <InfoItem
              icon={<Building />}
              label="Branch"
              value={user.branch || 'N/A'}
            />
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 text-lg font-semibold">Security Settings</h3>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-primary" />
                  Multi-Factor Authentication (MFA Enabled)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require a second verification step for enhanced security.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">Active MFA Channel:</span>
                  <Badge variant="outline">
                    {user.mfaEnabled ? 'Email OTP / Authenticator App' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSavingMfa && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                  checked={user.mfaEnabled}
                  onCheckedChange={handleMfaToggle}
                  disabled={isSavingMfa}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-4', className)}>
      <div className="mt-1 h-6 w-6 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
