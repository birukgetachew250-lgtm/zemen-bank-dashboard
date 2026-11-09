'use client';

import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Mail,
  Phone,
  Globe2,
  Building2,
  CalendarDays,
  MapPin,
  Smartphone,
  Hash,
  Link as LinkIcon,
  Unlink,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export interface CustomerDetails {
  id: string;
  cifNumber: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  nationality: string;
  branchName: string;
  branchCode?: string;
  mobileStatus: string;
  ussdStatus: string;
  insertDate: string;
}

interface CustomerDetailsCardProps {
  customer: CustomerDetails;
}

const statusStyle = (s?: string) => {
  const v = (s || '').toLowerCase();
  if (v === 'active')
    return {
      dot: 'bg-emerald-500',
      cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    };
  if (v === 'registered' || v === 'pending')
    return {
      dot: 'bg-amber-500',
      cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    };
  if (v === 'suspended' || v === 'inactive')
    return {
      dot: 'bg-rose-500',
      cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30',
    };
  return {
    dot: 'bg-sky-500',
    cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/30',
  };
};

function StatusPill({ value }: { value?: string }) {
  const st = statusStyle(value);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${st.cls}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${st.dot}`}
        />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${st.dot}`} />
      </span>
      {value || '—'}
    </span>
  );
}

export function CustomerDetailsCard({ customer }: CustomerDetailsCardProps) {
  const router = useRouter();
  const initials = (customer.name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden border-border/80 p-0 shadow-lg hover:translate-y-0">
      {/* Banner */}
      <div
        className="relative px-6 pb-16 pt-6 text-white"
        style={{
          background:
            'radial-gradient(80% 140% at 100% 0%, hsl(347 75% 38%), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(233 60% 36%), transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
        }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[hsl(347,90%,60%)] opacity-25 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur-md">
            <Hash className="h-3.5 w-3.5 text-[hsl(38,92%,60%)]" /> CIF{' '}
            <span className="font-mono text-sm font-bold text-white">{customer.cifNumber}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-xl border-white/20 bg-white/10 text-xs text-white backdrop-blur hover:bg-white/20 hover:text-white"
              onClick={() => router.push(`/customers/${customer.cifNumber}/edit`)}
            >
              <Edit className="h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-xl bg-[hsl(347,78%,46%)] text-xs font-semibold text-white hover:bg-[hsl(347,78%,40%)]"
              onClick={() => router.push(`/customers/${customer.cifNumber}`)}
            >
              Open 360° Profile <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Identity row overlapping banner */}
      <div className="relative -mt-12 flex flex-wrap items-end justify-between gap-4 px-6">
        <div className="flex flex-wrap items-end gap-4">
          <Avatar className="h-24 w-24 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.5)] ring-4 ring-card">
            <AvatarImage src="/images/avatar.png" alt={customer.name} />
            <AvatarFallback className="bg-gradient-to-br from-[hsl(347,72%,44%)] to-[hsl(233,55%,45%)] text-2xl font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="pb-1">
            <CardTitle className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
              {customer.name}
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Smartphone className="h-3 w-3" /> Mobile
              </span>
              <StatusPill value={customer.mobileStatus} />
              <span className="ml-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                USSD
              </span>
              <StatusPill value={customer.ussdStatus} />
            </div>
          </div>
        </div>

        {/* Quick Action Strip */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-xl text-xs"
            onClick={() =>
              router.push(`/customers/link-account?cif=${encodeURIComponent(customer.cifNumber)}`)
            }
          >
            <LinkIcon className="h-3.5 w-3.5 text-cyan-500" />
            Link Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-xl text-xs"
            onClick={() => router.push('/customers/unlink-account')}
          >
            <Unlink className="h-3.5 w-3.5 text-amber-500" />
            Unlink
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-xl text-xs"
            onClick={() => router.push('/customers/request-pin-reset')}
          >
            <KeyRound className="h-3.5 w-3.5 text-rose-500" />
            PIN Reset
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={<Mail className="h-4 w-4" />} label="Email Address" value={customer.email} />
          <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone Number" value={customer.phoneNumber} />
          <InfoItem icon={<Globe2 className="h-4 w-4" />} label="Nationality" value={customer.nationality} />
          <InfoItem icon={<Building2 className="h-4 w-4" />} label="Registered Branch" value={customer.branchName} />
          <InfoItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Registration Date"
            value={customer.insertDate ? new Date(customer.insertDate).toLocaleDateString() : '—'}
          />
          <InfoItem icon={<MapPin className="h-4 w-4" />} label="Full Address" value={customer.address} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md ${
        className || ''
      }`}
    >
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border/80 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 break-words text-sm font-medium text-foreground">{value || '—'}</div>
      </div>
    </div>
  );
}
