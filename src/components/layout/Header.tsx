
"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";

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

const findCurrentPage = (menuItems: MenuItem[], pathname: string): MenuItem | undefined => {
    for (const item of menuItems) {
      if (item.href === pathname) {
        return item;
      }
      if (item.children) {
        const child = findCurrentPage(item.children, pathname);
        if (child) return child;
      }
    }
  };
  
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const currentPage = findCurrentPage(menu, pathname);

  const handleLogout = async () => {
    toast({ title: 'Logged out successfully.' });
    // Since there's no login page, we can just redirect to dashboard
    router.push('/dashboard');
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
                    <p key={item.label}>Nav Item</p>
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
                <AvatarImage src="/images/avatar.png" alt="Admin User" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@zemen.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
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
