'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  User,
  Landmark,
  Smartphone,
  Shield,
  Edit,
  Unlink,
  Loader2,
  Cpu,
  BellRing,
  Clock,
  RefreshCw,
  Fingerprint,
  CheckCircle2,
  Tablet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CustomerDeviceItem {
  id: string;
  cif: string;
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  deviceNameAndModel: string;
  deviceOs: string;
  deviceOsVersion: string;
  platformOs: string;
  deviceType: string;
  appVersion: string;
  status: string;
  lastSeenAt: string | null;
  pushProvider: string;
  pushNotificationStatus: string;
  tokenLastRefreshedAt: string | null;
}

const MFA_CHANNEL_LABELS: Record<string, string> = {
  SMSOTP: 'SMS OTP',
  GAUTH: 'Authenticator App (TOTP)',
  EMAILOTP: 'Email OTP',
  SQ: 'Security Question',
  None: 'Disabled (None)',
};

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'secondary';
    case 'dormant':
      return 'outline';
    case 'frozen':
    case 'inactive':
      return 'destructive';
    default:
      return 'default';
  }
};

function CustomerDetailsPageContent({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [devices, setDevices] = useState<CustomerDeviceItem[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mfaSaving, setMfaSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchDevices = useCallback(async (cifOrId: string) => {
    setDevicesLoading(true);
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(cifOrId)}/devices`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const customerRes = await fetch(`/api/customers/${customerId}`);
        if (!customerRes.ok) throw new Error('Customer not found');
        const customerData = await customerRes.json();
        setCustomer(customerData);

        const [accountsRes] = await Promise.all([
          fetch(`/api/customers/${customerId}/accounts`),
          fetchDevices(customerData.cifNumber || customerId),
        ]);

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          setAccounts(accountsData);
        }
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setLoading(false);
      }
    }
    if (customerId) {
      fetchData();
    }
  }, [customerId, toast, fetchDevices]);

  const handleUnlink = async (accountNumber: string) => {
    if (!customer) return;

    try {
      const response = await fetch('/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cif: customer.cifNumber,
          type: 'unlink-account',
          customerName: customer.name,
          customerPhone: customer.phoneNumber,
          details: { accountNumber },
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request account unlinking');
      }
      toast({
        title: 'Request Submitted',
        description: `Request to unlink account ${accountNumber} has been sent for approval.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
    }
  };

  const isMfaEnabled = Boolean(
    customer?.signUp2FA && customer.signUp2FA !== 'None' && customer.signUp2FA !== ''
  );
  const activeMfaChannelCode = isMfaEnabled ? customer.signUp2FA : 'SMSOTP';

  const handleMfaToggle = async (enabled: boolean, channelOverride?: string) => {
    if (!customer) return;
    setMfaSaving(true);
    const channelToUse = enabled
      ? channelOverride ||
        (customer.signUp2FA && customer.signUp2FA !== 'None'
          ? customer.signUp2FA
          : 'SMSOTP')
      : 'None';

    try {
      const res = await fetch(
        `/api/customers/${encodeURIComponent(customer.cifNumber || customerId)}/mfa`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mfaEnabled: enabled,
            mfaChannel: channelToUse,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update MFA configuration');
      }
      setCustomer((prev: any) => ({
        ...prev,
        signUp2FA: data.signUp2FA,
      }));
      toast({
        title: 'MFA Configuration Updated',
        description: data.message,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'MFA Update Failed',
        description: err.message,
      });
    } finally {
      setMfaSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return <div className="p-8 text-center">Customer not found.</div>;
  }

  const fullName = customer.name;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/images/avatar.png" alt={fullName} />
              <AvatarFallback>
                {fullName
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-3xl font-bold">{fullName}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                CIF: {customer.cifNumber}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/customers/${customerId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profile Details
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Landmark className="mr-2 h-4 w-4" /> Linked Accounts
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Smartphone className="mr-2 h-4 w-4" /> User Device Info
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" /> Device &amp; Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Detailed information about the customer.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  label="Mobile Status"
                  value={
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      {customer.mobileStatus}
                    </Badge>
                  }
                />
                <InfoItem
                  label="USSD Status"
                  value={
                    <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      {customer.ussdStatus}
                    </Badge>
                  }
                />
                <InfoItem label="Email Address" value={customer.email} />
                <InfoItem label="Phone Number" value={customer.phoneNumber} />
                <InfoItem label="Nationality" value={customer.nationality} />
                <InfoItem label="Registered Branch" value={customer.branchName} />
                <InfoItem
                  label="Registration Date"
                  value={new Date(customer.insertDate).toLocaleDateString()}
                />
                <InfoItem
                  label="Full Address"
                  value={customer.address}
                  className="lg:col-span-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>
                All bank accounts linked to this customer profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc: any) => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-mono font-medium">
                        {acc.accountNumber}
                      </TableCell>
                      <TableCell>{acc.accountType}</TableCell>
                      <TableCell>{acc.currency}</TableCell>
                      <TableCell>{acc.branchName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(acc.status)}
                          className={
                            acc.status === 'Active'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : ''
                          }
                        >
                          {acc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnlink(acc.accountNumber)}
                        >
                          <Unlink className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6.1 & 6.2 User Device Info (DEVICE_CONTROL_MODULE) */}
        <TabsContent value="devices" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Device Info</CardTitle>
                <CardDescription>
                  Registered customer devices and FCM push notification tokens from DEVICE_CONTROL_MODULE.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDevices(customer.cifNumber || customerId)}
                disabled={devicesLoading}
                className="gap-1.5"
              >
                <RefreshCw
                  className={cn('h-3.5 w-3.5', devicesLoading && 'animate-spin')}
                />
                Refresh Devices
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {devicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : devices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <Smartphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    No registered devices found for CIF {customer.cifNumber}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Devices enrolled in the Zemen SuperApp (DEVICE_CONTROL_MODULE.CustomerDevices) will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((dev) => {
                    const isDeviceActive =
                      String(dev.status || '').toLowerCase() === 'active';
                    const isPushActive =
                      String(dev.pushNotificationStatus || '').toLowerCase() === 'active';

                    return (
                      <div
                        key={dev.id || dev.deviceId}
                        className="rounded-2xl border border-border/80 bg-muted/15 p-5 transition-all hover:border-primary/30"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {String(dev.deviceType).toLowerCase() === 'tablet' ? (
                                <Tablet className="h-5 w-5" />
                              ) : (
                                <Smartphone className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-foreground">
                                {dev.deviceNameAndModel}
                              </h4>
                              <p className="font-mono text-xs text-muted-foreground">
                                Device ID: {dev.deviceId}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                isDeviceActive
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              )}
                            >
                              Registration: {dev.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                isPushActive
                                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                  : 'border-border bg-muted text-muted-foreground'
                              )}
                            >
                              Push ({dev.pushProvider}): {dev.pushNotificationStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <DeviceField
                            icon={<Smartphone className="h-4 w-4" />}
                            label="Device Name & Model"
                            value={dev.deviceNameAndModel}
                          />
                          <DeviceField
                            icon={<Cpu className="h-4 w-4" />}
                            label="Platform / OS"
                            value={dev.platformOs}
                          />
                          <DeviceField
                            icon={<Tablet className="h-4 w-4" />}
                            label="Device Type"
                            value={dev.deviceType}
                          />
                          <DeviceField
                            icon={<Fingerprint className="h-4 w-4" />}
                            label="Unique Device ID"
                            value={<span className="font-mono text-xs">{dev.deviceId}</span>}
                          />
                          <DeviceField
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            label="App Version"
                            value={dev.appVersion}
                          />
                          <DeviceField
                            icon={<Shield className="h-4 w-4" />}
                            label="Registration Status"
                            value={dev.status}
                          />
                          <DeviceField
                            icon={<Clock className="h-4 w-4" />}
                            label="Last Seen"
                            value={
                              dev.lastSeenAt
                                ? new Date(dev.lastSeenAt).toLocaleString()
                                : 'Never'
                            }
                          />
                          <DeviceField
                            icon={<BellRing className="h-4 w-4" />}
                            label="Push Notification Status"
                            value={`${dev.pushNotificationStatus} (${dev.pushProvider})`}
                          />
                          <DeviceField
                            icon={<RefreshCw className="h-4 w-4" />}
                            label="Token Last Refreshed"
                            value={
                              dev.tokenLastRefreshedAt
                                ? new Date(dev.tokenLastRefreshedAt).toLocaleString()
                                : 'N/A'
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5.1 & 5.2 Device & Security Management (Reset Security Question removed, MFA toggle + active channel added) */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Device &amp; Security Management</CardTitle>
              <CardDescription>
                Manage customer authentication channels and Multi-Factor Authentication (MFA).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <InfoItem
                  label="Primary Authentication"
                  value={
                    <Badge variant="secondary">
                      {MFA_CHANNEL_LABELS[customer.signUpMainAuth] ||
                        customer.signUpMainAuth ||
                        'SMS OTP'}
                    </Badge>
                  }
                />
                <InfoItem
                  label="Active MFA Channel"
                  value={
                    <Badge
                      variant="outline"
                      className={cn(
                        isMfaEnabled
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {MFA_CHANNEL_LABELS[customer.signUp2FA] ||
                        customer.signUp2FA ||
                        'Disabled'}
                    </Badge>
                  }
                />
                <InfoItem
                  label="Enrolled App Channel"
                  value={<Badge variant="secondary">{customer.channel}</Badge>}
                />
              </div>

              <Separator />

              {/* 5.1 MFA Enabled Toggle & Active MFA Channel Selector */}
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-muted/20 p-5 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="customer-mfa-toggle" className="text-base font-bold">
                      Multi-Factor Authentication (MFA Enabled)
                    </Label>
                    <Badge
                      variant="outline"
                      className={cn(
                        isMfaEnabled
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {isMfaEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active MFA Channel:{' '}
                    <span className="font-semibold text-foreground">
                      {MFA_CHANNEL_LABELS[customer.signUp2FA] ||
                        customer.signUp2FA ||
                        'None'}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isMfaEnabled && (
                    <Select
                      value={activeMfaChannelCode}
                      onValueChange={(val) => handleMfaToggle(true, val)}
                      disabled={mfaSaving}
                    >
                      <SelectTrigger className="h-9 w-52 text-xs">
                        <SelectValue placeholder="Select MFA Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMSOTP">SMS OTP</SelectItem>
                        <SelectItem value="GAUTH">Authenticator App (TOTP)</SelectItem>
                        <SelectItem value="EMAILOTP">Email OTP</SelectItem>
                        <SelectItem value="SQ">Security Question</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center gap-2">
                    {mfaSaving && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <Switch
                      id="customer-mfa-toggle"
                      checked={isMfaEnabled}
                      onCheckedChange={(checked) => handleMfaToggle(checked)}
                      disabled={mfaSaving}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CustomerDetailsPage({
  params,
}: {
  params: { customerId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CustomerDetailsPageContent customerId={params.customerId} />
    </Suspense>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="font-semibold text-foreground">{value || '—'}</div>
    </div>
  );
}

function DeviceField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 break-words text-sm font-semibold text-foreground">
          {value || '—'}
        </div>
      </div>
    </div>
  );
}
