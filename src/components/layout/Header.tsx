
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Settings, User, Bell, Search, ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { menu, type MenuItem } from '@/lib/menu';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { cn } from '@/lib/utils';

/* ─── Build breadcrumbs from pathname ─── */
function buildBreadcrumbs(menuItems: MenuItem[], pathname: string): MenuItem[] {
  for (const item of menuItems) {
    if (item.href && pathname === item.href) return [item];
    if (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href) && !item.children) return [item];
    if (item.children) {
      const childCrumbs = buildBreadcrumbs(item.children, pathname);
      if (childCrumbs.length > 0) return [item, ...childCrumbs];
    }
  }
  return [];
}

function hasPermission(userPermissions: string[], item: MenuItem): boolean {
  if (userPermissions.includes('all')) return true;
  const permissionId = item.href || item.label;
  return userPermissions.includes(permissionId);
}

function hasAccessToAnyChild(item: MenuItem, userPermissions: string[]): boolean {
  if (!item.children) return false;
  return item.children.some(
    child => hasPermission(userPermissions, child) || hasAccessToAnyChild(child, userPermissions)
  );
}

function MobileSidebarNavItem({ item, pathname, userPermissions }: { item: MenuItem; pathname: string; userPermissions: string[] }) {
  const Icon = item.icon;
  const canAccess = item.label === 'Dashboard' || hasPermission(userPermissions, item) || hasAccessToAnyChild(item, userPermissions);
  if (!canAccess) return null;

  if (item.children) {
    const accessibleChildren = item.children.filter(
      child => hasPermission(userPermissions, child) || hasAccessToAnyChild(child, userPermissions)
    );
    if (accessibleChildren.length === 0 && !item.href) return null;
    const isChildActive = accessibleChildren.some(
      child =>
        (child.href && pathname.startsWith(child.href)) ||
        (child.children && child.children.some(sub => sub.href && pathname.startsWith(sub.href)))
    );
    return (
      <Accordion type="single" collapsible className="w-full" defaultValue={isChildActive ? `item-${item.label}` : undefined}>
        <AccordionItem value={`item-${item.label}`} className="border-b-0">
          <AccordionTrigger
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline',
              isChildActive && 'bg-sidebar-accent/40 text-sidebar-accent-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-3 pt-0.5 pb-0">
            <div className="flex flex-col gap-0.5 border-l border-sidebar-border/50 ml-3 pl-2">
              {accessibleChildren.map(child => (
                <MobileSidebarNavItem key={child.href || child.label} item={child} pathname={pathname} userPermissions={userPermissions} />
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
        'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive
          ? 'bg-gradient-to-r from-[hsl(347,72%,44%)] to-[hsl(347,72%,38%)] text-white font-semibold'
          : 'text-sidebar-foreground/75'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/* ─── Infer role display name from permissions ─── */
function getRoleLabel(permissions: string[]): { label: string; color: string } {
  if (permissions.includes('all')) return { label: 'Super Admin', color: 'bg-violet-100 text-violet-700 border-violet-200' };
  const hasChecker = permissions.some(p => p.includes('approve') || p.includes('checker'));
  if (hasChecker) return { label: 'Checker Admin', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  return { label: 'Maker Admin', color: 'bg-amber-100 text-amber-700 border-amber-200' };
}

export function Header({ user, userPermissions }: { user: any; userPermissions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const breadcrumbs = buildBreadcrumbs(menu, pathname);
  const currentPage = breadcrumbs[breadcrumbs.length - 1];
  const role = getRoleLabel(userPermissions);
  const initials = (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    toast({ title: 'Logging out...' });
    await signOut({ redirect: false });
    router.replace('/login');
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 md:px-6"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid hsl(220, 13%, 90%)',
        boxShadow: '0 1px 0 0 rgba(34,47,90,0.05), 0 4px 16px 0 rgba(34,47,90,0.04)',
      }}
    >
      {/* ─── Left: Mobile menu + Breadcrumbs ─── */}
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-slate-100"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col p-0"
              style={{ background: 'hsl(222, 47%, 8%)', border: 'none' }}
            >
              <SheetHeader
                className="flex flex-row h-16 items-center gap-3 px-4"
                style={{ borderBottom: '1px solid hsl(222, 35%, 14%)' }}
              >
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10">
                    <Image src="/images/logo.png" alt="Zemen Bank" width={32} height={32} className="object-cover" />
                  </div>
                  <SheetTitle className="text-sm font-bold text-white">Zemen Bank</SheetTitle>
                </Link>
                <SheetDescription className="sr-only">Main Navigation</SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <nav className="flex flex-col gap-0.5 p-3">
                  {menu.map(item => (
                    <MobileSidebarNavItem key={item.label} item={item} pathname={pathname} userPermissions={userPermissions} />
                  ))}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0">
          {breadcrumbs.length > 1 ? (
            <>
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.label} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <h1 className="text-sm font-semibold text-foreground truncate">{crumb.label}</h1>
                  ) : (
                    <span className="text-sm text-muted-foreground truncate hidden sm:block">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </>
          ) : (
            <h1 className="text-base font-semibold text-foreground">
              {currentPage?.label || 'Dashboard'}
            </h1>
          )}
        </div>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-slate-100 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(347,72%,44%)]"
            style={{ boxShadow: '0 0 6px hsl(347,72%,44%)' }}
          />
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-100 outline-none"
              id="user-menu-trigger"
            >
              <Avatar className="h-8 w-8 ring-2 ring-[hsl(347,72%,44%)/0.3]">
                <AvatarImage src="/images/avatar.png" alt={user?.name || 'User'} />
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(347,72%,44%), hsl(347,72%,34%))' }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">{user?.name || 'User'}</p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold border leading-none mt-0.5',
                    role.color
                  )}
                >
                  {role.label}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 rounded-xl p-1"
            align="end"
            forceMount
            style={{ boxShadow: '0 8px 32px rgba(34,47,90,0.14), 0 1px 4px rgba(34,47,90,0.08)' }}
          >
            <DropdownMenuLabel className="font-normal px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 ring-2 ring-[hsl(347,72%,44%)/0.2]">
                  <AvatarImage src="/images/avatar.png" alt={user?.name || 'User'} />
                  <AvatarFallback
                    className="text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(347,72%,44%), hsl(347,72%,34%))' }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">{user?.email}</p>
                  <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold border leading-none mt-1', role.color)}>
                    {role.label}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg cursor-pointer"
              onClick={() => router.push('/profile')}
            >
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg cursor-pointer"
              onClick={() => router.push('/settings')}
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
