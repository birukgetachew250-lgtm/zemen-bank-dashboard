
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { menu, type MenuItem } from '@/lib/menu';
import { ScrollArea } from '../ui/scroll-area';

function SidebarNavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
    const isActive = item.href ? pathname === item.href : false;
    const isChildActive =
      item.children?.some((child) => child.href && pathname.startsWith(child.href)) ?? false;
  
    const Icon = item.icon;
  
    if (item.children) {
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
                {item.children.map((child) => (
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
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

export function Sidebar() {
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
            <SidebarNavItem key={item.label} item={item} pathname={pathname} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
