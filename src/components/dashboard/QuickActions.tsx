'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  UserPlus, Link2, KeyRound, ShieldAlert, Smartphone, LockOpen, ArrowUpRight, Zap,
} from 'lucide-react';

const ACTIONS = [
  { href: '/customers/create',                 label: 'New Customer',     desc: 'Enroll a customer',        icon: UserPlus,   tone: '347 77% 46%' },
  { href: '/customers/link-account',           label: 'Link Account',     desc: 'CASA & loan accounts',     icon: Link2,      tone: '233 60% 55%' },
  { href: '/customers/request-pin-reset',      label: 'PIN Reset',        desc: 'Issue a temporary PIN',    icon: KeyRound,   tone: '38 92% 48%' },
  { href: '/customers/request-security-reset', label: 'Security Reset',   desc: 'New question & answer',    icon: ShieldAlert,tone: '271 70% 55%' },
  { href: '/customers/resend-activation',      label: 'Send Activation',  desc: 'Resend activation code',   icon: Smartphone, tone: '199 89% 45%' },
  { href: '/customers/unlock-customer',        label: 'Unlock Customer',  desc: 'Release a locked profile', icon: LockOpen,   tone: '152 65% 38%' },
];

/** Branch-teller style quick actions – only shows what the signed-in user may open. */
export function QuickActions() {
  const { data: session } = useSession();
  const perms: string[] = (session as any)?.permissions || [];
  const visible = ACTIONS.filter((a) => perms.includes('all') || perms.includes(a.href));
  if (visible.length === 0) return null;

  return (
    <div data-reveal>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">Start a maker request — a checker will review it.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={a.href}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur transition-shadow hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.25)]"
                style={{ ['--tone' as any]: a.tone }}
              >
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[hsl(var(--tone)/0.18)] blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[hsl(var(--tone)/0.3)]" />
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--tone)/0.18)] to-[hsl(var(--tone)/0.06)] text-[hsl(var(--tone))] ring-1 ring-[hsl(var(--tone)/0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                  <p className="truncate text-xs text-slate-500">{a.desc}</p>
                </div>
                <ArrowUpRight className="relative h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--tone))]" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
