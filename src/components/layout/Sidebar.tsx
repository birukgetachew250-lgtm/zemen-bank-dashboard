
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

function hasPermission(userPermissions: string[], item: MenuItem): boolean {
    if (userPermissions.includes('all')) {
        return true;
    }
    // Use href for permission check if it exists, otherwise use the label as a fallback for parent categories.
    const permissionId = item.href || item.label;
    return userPermissions.includes(permissionId);
}

function hasAccessToAnyChild(item: MenuItem, userPermissions: string[]): boolean {
    if (!item.children) {
        return false;
    }
    return item.children.some(child => {
        // A child is accessible if the user has direct permission for it OR if it has accessible children itself.
        return hasPermission(userPermissions, child) || hasAccessToAnyChild(child, userPermissions);
    });
}


function SidebarNavItem({ item, pathname, userPermissions }: { item: MenuItem; pathname: string, userPermissions: string[] }) {
    const Icon = item.icon;

    // An item is accessible if it's the dashboard, if user has direct permission, or if user has permission to any of its descendants.
    const canAccess = item.label === "Dashboard" || hasPermission(userPermissions, item) || hasAccessToAnyChild(item, userPermissions);

    if (!canAccess) {
        return null;
    }

    if (item.children) {
      const accessibleChildren = item.children.filter(child => 
         hasPermission(userPermissions, child) || hasAccessToAnyChild(child, userPermissions)
      );
        
      if (accessibleChildren.length === 0 && !item.href) {
          return null;
      }
        
      const isChildActive = accessibleChildren.some(child => 
        child.href && pathname.startsWith(child.href) || 
        (child.children && child.children.some(subChild => subChild.href && pathname.startsWith(subChild.href)))
      );

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
                isChildActive && 'bg-sidebar-accent/50 text-sidebar-accent-foreground',
                'hover:no-underline'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4 pt-1 pb-0">
              <div className="flex flex-col space-y-1">
                {accessibleChildren.map((child) => (
                  <SidebarNavItem key={child.href || child.label} item={child} pathname={pathname} userPermissions={userPermissions} />
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
          pathname === item.href && 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
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
