
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { type LucideIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { menu, type MenuItem } from '@/lib/menu';
import { ScrollArea } from '../ui/scroll-area';

function SidebarNavItem({ item, pathname, userPermissions }: { item: MenuItem; pathname: string, userPermissions: string[] }) {
    const Icon = item.icon;

    // Check if user has permission for this item or is a super admin
    const isSuperAdmin = userPermissions.includes('approve-all');
    const hasPermission = isSuperAdmin || !item.permission || userPermissions.includes(item.permission);

    if (!hasPermission) {
        return null;
    }

    if (item.children) {
      // Filter children based on permissions
      const visibleChildren = item.children.filter(child => 
        isSuperAdmin || !child.permission || userPermissions.includes(child.permission)
      );

      // If no children are visible, don't render the parent accordion
      if (visibleChildren.length === 0) {
        return null;
      }

      const isChildActive = visibleChildren.some((child) => child.href && pathname.startsWith(child.href)) ?? false;

      return (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={isChildActive ? `item-${item.label}` : undefined}
        >
          <AccordionItem value={`item-${item.label}`} className="border-b-0">
            <AccordionTrigger
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isChildActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                'hover:no-underline'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4 pt-2 pb-0">
              <div className="flex flex-col space-y-1">
                {visibleChildren.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href || '#'}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                      pathname === child.href &&
                        'bg-sidebar-primary/10 text-sidebar-primary font-semibold'
                    )}
                  >
                    <span className="pl-5">{child.label}</span>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }
  
    return (
      <Link
        href={item.href || '#'}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

export function Sidebar({ userPermissions }: { userPermissions: string[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <Image src="/images/logo.png" alt="Zemen Bank" width={32} height={32} />
          <span className="">Zemen Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid items-start gap-1 p-2 text-sm font-medium">
          {menu.map((item) => (
            <SidebarNavItem key={item.label} item={item} pathname={pathname} userPermissions={userPermissions} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
