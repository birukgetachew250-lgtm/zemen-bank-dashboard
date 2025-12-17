
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { menu } from '@/lib/menu';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const getPageTitle = () => {
    // Traverse the menu to find the matching label for the current path
    const findLabel = (items: typeof menu): string | null => {
        for (const item of items) {
            if (item.href === pathname) {
                return item.label;
            }
            if (item.children) {
                const childLabel = findLabel(item.children as any);
                if (childLabel) return childLabel;
            }
        }
        
        // Handle dynamic routes like customer details
        if (pathname.startsWith('/customers/cust_')) return "Customer Details";
        if (pathname.startsWith('/corporates/details')) return "Corporate Client Details";


        return null;
    };
    return findLabel(menu) || "Dashboard";
  };
  
  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if(response.ok) {
        router.push('/login');
        router.refresh();
        toast({ title: 'Logged out successfully.' });
    } else {
        toast({ variant: 'destructive', title: 'Logout failed.' });
    }
  };


  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/seed/admin-user/100/100" alt="Admin User" />
                <AvatarFallback>AU</AvatarFallback>
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
            <DropdownMenuItem>
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
