
"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { menu, type MenuItem } from "@/lib/menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Menu as MenuIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { cn } from "@/lib/utils";


const findCurrentPage = (menuItems: MenuItem[], pathname: string): MenuItem | undefined => {
    // Special case for root
    if (pathname === '/dashboard') {
        return menu.find(item => item.href === '/dashboard');
    }
    for (const item of menuItems) {
      if (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href)) {
        return item;
      }
      if (item.children) {
        const child = findCurrentPage(item.children, pathname);
        if (child) return child;
      }
    }
  };
  
function MobileSidebarNavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const Icon = item.icon;

  if (item.children) {
    const isChildActive = item.children.some(child => 
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
              {item.children.map((child) => (
                <MobileSidebarNavItem key={child.label} item={child} pathname={pathname} />
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

export function Header({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const currentPage = findCurrentPage(menu, pathname);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast({ title: 'Logged out successfully.' });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                  <Image src="/images/logo.png" alt="Zemen Bank" width={32} height={32} />
                  <span className="">Zemen Admin</span>
                </Link>
              </div>
               <ScrollArea className="flex-1">
                <nav className="grid items-start gap-1 p-2 text-sm font-medium">
                  {menu.map((item) => (
                    <MobileSidebarNavItem key={item.label} item={item} pathname={pathname} />
                  ))}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
         <h1 className="text-xl font-semibold tracking-tight">
          {currentPage?.label || 'Dashboard'}
        </h1>
      </div>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/images/avatar.png" alt={user?.name || 'User'} />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
