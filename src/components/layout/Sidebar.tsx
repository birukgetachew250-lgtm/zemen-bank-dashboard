
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { type LucideIcon, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { menu, type MenuItem } from '@/lib/menu';
import { ScrollArea } from '../ui/scroll-area';

function hasPermission(userPermissions: string[], item: MenuItem): boolean {
  if (userPermissions.includes('all')) return true;
  const permissionId = item.href || item.label;
  return userPermissions.includes(permissionId);
}

function hasAccessToAnyChild(item: MenuItem, userPermissions: string[]): boolean {
  if (!item.children) return false;
  return item.children.some(child =>
    hasPermission(userPermissions, child) || hasAccessToAnyChild(child, userPermissions)
  );
}

/* ─── Section accent colors by top-level label ─── */
const sectionAccents: Record<string, string> = {
  'Dashboard':            'text-rose-400',
  'Overview':             'text-amber-400',
  'Customer Records':     'text-sky-400',
  'Account Management':   'text-cyan-400',
  'Customer Security':    'text-indigo-400',
  'Online Linking':       'text-fuchsia-400',
  'Administration':       'text-violet-400',
  'App Control':          'text-teal-400',
  'Oversight':            'text-orange-400',
  'System Monitoring':    'text-green-400',
  'Reporting':            'text-blue-400',
  'Integrations':         'text-emerald-400',
  'Security & Access':    'text-pink-400',
  'WSO2 Integration':     'text-indigo-300',
  'Settings':             'text-slate-400',
};

function getAccentColor(label: string): string {
  return sectionAccents[label] || 'text-sidebar-foreground';
}

function SidebarNavItem({
  item,
  pathname,
  userPermissions,
  depth = 0,
  parentLabel,
}: {
  item: MenuItem;
  pathname: string;
  userPermissions: string[];
  depth?: number;
  parentLabel?: string;
}) {
  const Icon = item.icon;
  const hasDirectAccess = hasPermission(userPermissions, item);
  const canAccess =
    item.label === 'Dashboard' || hasDirectAccess || hasAccessToAnyChild(item, userPermissions);

  if (!canAccess) return null;

  const accentClass = depth === 0 ? getAccentColor(item.label) : '';

  if (item.children) {
    const accessibleChildren = hasDirectAccess
      ? item.children
      : item.children.filter(
          child =>
            hasPermission(userPermissions, child) || hasAccessToAnyChild(child, userPermissions)
        );

    if (accessibleChildren.length === 0 && !item.href) return null;

    const isChildActive = accessibleChildren.some(
      child =>
        (child.href && (pathname === child.href || pathname.startsWith(child.href + '/'))) ||
        (child.children &&
          child.children.some(sub => sub.href && (pathname === sub.href || pathname.startsWith(sub.href + '/'))))
    );

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        key={`${item.label}-${isChildActive}`}
        defaultValue={isChildActive ? `item-${item.label}` : undefined}
      >
        <AccordionItem value={`item-${item.label}`} className="border-b-0">
          <AccordionTrigger
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'text-sidebar-foreground/80 hover:text-sidebar-accent-foreground',
              'hover:bg-sidebar-accent/60 hover:no-underline',
              depth === 0 && 'py-2.5',
              depth > 0 && 'py-2 text-[13px]',
              isChildActive && 'bg-sidebar-accent/40 text-sidebar-accent-foreground'
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  'flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200',
                  depth === 0 && isChildActive
                    ? 'bg-white/10'
                    : depth === 0
                    ? 'bg-white/5 group-hover:bg-white/10'
                    : ''
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-all duration-200',
                    depth === 0 ? accentClass : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                  )}
                />
              </div>
              <span className="truncate">{item.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className={cn('pb-0', depth === 0 ? 'pl-3 pt-0.5' : 'pl-3 pt-0')}>
            <div className="flex flex-col gap-0.5 border-l border-sidebar-border/50 ml-3 pl-2">
              {accessibleChildren.map(child => (
                <SidebarNavItem
                  key={child.href || child.label}
                  item={child}
                  pathname={pathname}
                  userPermissions={userPermissions}
                  depth={depth + 1}
                  parentLabel={item.label}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 transition-all duration-200',
        depth === 0 ? 'py-2.5 text-sm font-medium' : 'py-2 text-[13px] font-normal',
        isActive
          ? [depth === 0 ? 'text-white font-semibold' : 'text-[hsl(347,90%,85%)] font-medium']
          : [
              'text-sidebar-foreground/75 hover:text-white hover:translate-x-0.5',
              'hover:bg-white/[0.06]',
            ]
      )}
    >
      {/* Sliding active pill – glides between items (shared layout animation) */}
      {isActive && (
        <motion.span
          layoutId={depth === 0 ? 'sidebar-active-pill' : 'sidebar-active-pill-sub'}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          className={cn(
            'absolute inset-0 rounded-xl',
            depth === 0
              ? 'bg-gradient-to-r from-[hsl(347,78%,48%)] via-[hsl(347,72%,42%)] to-[hsl(335,70%,36%)] shadow-[0_8px_24px_-6px_hsl(347_80%_50%/0.65),inset_0_1px_0_rgba(255,255,255,0.25)]'
              : 'bg-[hsl(347,72%,44%/0.18)] ring-1 ring-inset ring-[hsl(347,72%,60%/0.25)]'
          )}
        />
      )}

      <div
        className={cn(
          'relative z-10 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200',
          isActive
            ? depth === 0
              ? 'bg-white/20'
              : 'bg-[hsl(347,72%,44%/0.2)]'
            : depth === 0
            ? 'bg-white/5 group-hover:bg-white/10'
            : ''
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 transition-all duration-200',
            isActive ? 'text-white' : depth === 0 ? accentClass : 'text-sidebar-foreground/55 group-hover:text-sidebar-foreground/90'
          )}
        />
      </div>
      <span className="relative z-10 truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ userPermissions }: { userPermissions: string[] }) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);

  // Pointer-following spotlight (CSS vars drive a radial gradient)
  const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = asideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);

  return (
    <aside
      ref={asideRef}
      onPointerMove={onMove}
      className="sidebar-aurora relative hidden md:flex flex-col w-64 flex-shrink-0 overflow-hidden"
      style={{ borderRight: '1px solid hsl(222, 35%, 16%)' }}
    >
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[hsl(347,80%,45%)] opacity-25 blur-[90px] animate-aurora" />
      <div className="pointer-events-none absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-[hsl(233,70%,55%)] opacity-20 blur-[100px] animate-aurora-slow" />
      {/* Cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [aside:hover_&]:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--mx,50%) var(--my,30%), rgba(255,255,255,0.07), transparent 70%)' }}
      />

      {/* ─── Logo / Brand Header ─── */}
      <div
        className="relative z-10 flex h-16 items-center gap-3 px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[hsl(347,80%,50%)] to-[hsl(38,92%,55%)] blur-md opacity-50 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/20 bg-white/5">
              <Image src="/images/logo.png" alt="Zemen Bank" fill className="object-cover" />
            </div>
          </motion.div>
          <div>
            <p className="text-[15px] font-bold leading-none tracking-wide bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Zemen Bank</p>
            <p className="text-[9px] leading-none mt-1 tracking-[0.25em] uppercase text-[hsl(38,92%,60%)]/80">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* ─── Navigation ─── */}
      <ScrollArea className="relative z-10 flex-1">
        <motion.nav
          className="flex flex-col gap-0.5 p-3 pb-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } } }}
        >
          {menu.map(item => (
            <motion.div
              key={item.label}
              variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } } }}
            >
              <SidebarNavItem
                item={item}
                pathname={pathname}
                userPermissions={userPermissions}
                depth={0}
              />
            </motion.div>
          ))}
        </motion.nav>
      </ScrollArea>

      {/* ─── Footer: secure-session card ─── */}
      <div className="relative z-10 p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
          <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-400/30">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Secure session
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">Maker–Checker enforced</p>
            </div>
            <Sparkles className="ml-auto h-3.5 w-3.5 text-[hsl(38,92%,60%)]/70" />
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] tracking-wide text-sidebar-foreground/30">© {new Date().getFullYear()} Zemen Bank S.C.</p>
      </div>
    </aside>
  );
}