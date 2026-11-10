'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UserMfaStatus {
  id: string;
  name: string;
  email: string;
  role: string;
  mfaStatus: string;
  method: string;
}

const statusConfig: { [key: string]: { Icon: React.ElementType; color: string } } = {
  Enrolled: { Icon: CheckCircle, color: 'text-emerald-500' },
  'Not Enrolled': { Icon: AlertTriangle, color: 'text-rose-500' },
  Pending: { Icon: AlertTriangle, color: 'text-amber-500' },
};

export default function MfaPoliciesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [policies, setPolicies] = useState({
    mfaRequired: true,
    allowedMfaMethods: ['email', 'sms', 'authenticator'],
    concurrentSessions: 1,
  });
  const [userMfaStatuses, setUserMfaStatuses] = useState<UserMfaStatus[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const { toast } = useToast();

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/security/policies');
      if (!res.ok) throw new Error('Failed to fetch policies.');
      const data = await res.json();
      setPolicies({
        mfaRequired: Boolean(data.mfaRequired),
        allowedMfaMethods: Array.isArray(data.allowedMfaMethods)
          ? data.allowedMfaMethods
          : ['email'],
        concurrentSessions: Number(data.concurrentSessions ?? 1),
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUserMfaStatuses = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users/mfa-status');
      if (!res.ok) throw new Error('Failed to fetch user MFA statuses.');
      const data = await res.json();
      setUserMfaStatuses(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Loading Users',
        description: error.message,
      });
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPolicies();
    fetchUserMfaStatuses();
  }, [fetchPolicies, fetchUserMfaStatuses]);

  const handleGlobalMfaToggle = async (checked: boolean) => {
    const nextPolicies = { ...policies, mfaRequired: checked };
    setPolicies(nextPolicies);
    setIsSaving(true);
    try {
      const res = await fetch('/api/security/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPolicies),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update MFA requirement');
      }
      toast({
        title: 'Global MFA Updated',
        description: `Global MFA enforcement is now ${checked ? 'Enabled' : 'Disabled'}.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserMfaToggle = async (user: UserMfaStatus, enabled: boolean) => {
    setTogglingUserId(user.id);
    try {
      const res = await fetch('/api/users/toggle-mfa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          mfaEnabled: enabled,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update user MFA status');
      }
      setUserMfaStatuses((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                mfaStatus: enabled ? 'Enrolled' : 'Not Enrolled',
                method: enabled ? 'Email OTP / Authenticator App' : 'N/A',
              }
            : u
        )
      );
      toast({
        title: 'User MFA Updated',
        description: `MFA ${enabled ? 'enabled' : 'disabled'} for ${user.name}.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/security/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policies),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save policies');
      }
      toast({ title: 'Success', description: 'Security policies have been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="relative mb-6 overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-lg animate-fade-up"
        style={{
          background:
            'radial-gradient(85% 140% at 100% 0%, hsl(220 80% 45% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 77% 40% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))',
        }}
      >
        <h1 className="relative z-10 text-3xl font-bold text-white">
          MFA &amp; Security Policies
        </h1>
        <p className="relative z-10 mt-2 text-white/80">
          Manage mandatory Multi-Factor Authentication and session concurrency policies.
        </p>
      </div>

      <Card className="glass-card animate-fade-up">
        <CardHeader>
          <CardTitle>Global Security Policies</CardTitle>
          <CardDescription>
            Configure MFA enforcement and active verification channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">MFA Enabled (Global Requirement)</Label>
                    <Badge
                      variant="outline"
                      className={
                        policies.mfaRequired
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }
                    >
                      {policies.mfaRequired ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enforce Multi-Factor Authentication for all portal users.
                  </p>
                  <div className="pt-1">
                    <Switch
                      checked={policies.mfaRequired}
                      onCheckedChange={handleGlobalMfaToggle}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Active MFA Channels</Label>
                  <p className="text-xs text-muted-foreground">
                    Configured delivery channels for OTP verification:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary"
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      Email OTP
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      SMS OTP
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      Authenticator App
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="max-w-sm">
                <Label className="font-semibold">Concurrent Sessions</Label>
                <Select
                  value={String(policies.concurrentSessions)}
                  onValueChange={(value) =>
                    setPolicies((prev) => ({
                      ...prev,
                      concurrentSessions: Number(value),
                    }))
                  }
                >
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
            </>
          )}
        </CardContent>
        <CardFooter className="justify-end border-t border-border pt-6">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Global Policies
          </Button>
        </CardFooter>
      </Card>

      <Card className="glass-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle>User MFA Status &amp; Channel</CardTitle>
          <CardDescription>
            Monitor and toggle MFA enrollment for individual users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>MFA Status</TableHead>
                  <TableHead>Active MFA Channel</TableHead>
                  <TableHead className="text-right">MFA Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5} className="py-4">
                          <div className="h-5 animate-pulse rounded-md bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : userMfaStatuses.map((user) => {
                      const isEnrolled = user.mfaStatus === 'Enrolled';
                      const { Icon, color } = statusConfig[user.mfaStatus] || {
                        Icon: AlertTriangle,
                        color: 'text-muted-foreground',
                      };
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${color}`} />
                              <span>{user.mfaStatus}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {isEnrolled ? `${user.method} OTP` : 'None'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              {togglingUserId === user.id && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                              )}
                              <Switch
                                checked={isEnrolled}
                                onCheckedChange={(checked) =>
                                  handleUserMfaToggle(user, checked)
                                }
                                disabled={togglingUserId === user.id}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
