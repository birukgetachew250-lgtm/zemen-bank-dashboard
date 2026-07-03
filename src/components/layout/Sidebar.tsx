
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { type LucideIcon, ChevronRight } from 'lucide-react';
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
  'Dashboard':         'text-rose-400',
  'Overview':          'text-amber-400',
  'Banking Users':     'text-sky-400',
  'Administration':    'text-violet-400',
  'App Control':       'text-teal-400',
  'Oversight':         'text-orange-400',
  'System Monitoring': 'text-green-400',
  'Reporting':         'text-blue-400',
  'Integrations':      'text-cyan-400',
  'Security & Access': 'text-pink-400',
  'WSO2 Integration':  'text-indigo-400',
  'Settings':          'text-slate-400',
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
        (child.href && pathname.startsWith(child.href)) ||
        (child.children &&
          child.children.some(sub => sub.href && pathname.startsWith(sub.href)))
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

  const isActive = pathname === item.href || (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 transition-all duration-200',
        depth === 0 ? 'py-2.5 text-sm font-medium' : 'py-2 text-[13px] font-normal',
        isActive
          ? [
              'text-white font-semibold',
              depth === 0
                ? 'bg-gradient-to-r from-[hsl(347,72%,44%)] to-[hsl(347,72%,38%)] shadow-lg shadow-[hsl(347,72%,44%)/0.3]'
                : 'bg-[hsl(347,72%,44%/0.15)] text-[hsl(347,72%,80%)]',
            ]
          : [
              'text-sidebar-foreground/75 hover:text-sidebar-accent-foreground',
              'hover:bg-sidebar-accent/60',
            ]
      )}
    >
      {/* Active left glow bar */}
      {isActive && depth === 0 && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-white/80" />
      )}

      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200',
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
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ userPermissions }: { userPermissions: string[] }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-64 flex-shrink-0"
      style={{
        background: 'hsl(222, 47%, 8%)',
        borderRight: '1px solid hsl(222, 35%, 14%)',
      }}
    >
      {/* ─── Logo / Brand Header ─── */}
      <div
        className="flex h-16 items-center gap-3 px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid hsl(222, 35%, 14%)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[hsl(347,72%,44%)] blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-[hsl(347,72%,44%)/0.5] transition-all duration-300">
              <Image src="/images/logo.png" alt="Zemen Bank" fill className="object-cover" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none tracking-wide">Zemen Bank</p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5 tracking-widest uppercase">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* ─── Navigation ─── */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-0.5 p-3 pb-6">
          {menu.map(item => (
            <SidebarNavItem
              key={item.label}
              item={item}
              pathname={pathname}
              userPermissions={userPermissions}
              depth={0}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* ─── Footer Bar ─── */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid hsl(222, 35%, 14%)' }}
      >
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-sidebar-foreground/30 text-center tracking-wide">
          © {new Date().getFullYear()} Zemen Bank S.C.
        </div>
      </div>
    </aside>
  );
}
