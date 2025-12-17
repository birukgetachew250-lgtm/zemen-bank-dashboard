
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { menu, MenuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

function NavMenuItem({ item }: { item: MenuItem }) {
    const pathname = usePathname();
    const isActive = item.href ? pathname === item.href : false;
    const isSubActive = item.children ? item.children.some(child => child.href && pathname === child.href) : false;

    if (item.children) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "text-sm font-medium",
                            isSubActive && "bg-accent text-accent-foreground"
                        )}
                    >
                        {item.label}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                    <DropdownMenuGroup>
                        {item.children.map((child, index) => (
                            <Link key={index} href={child.href || "#"} passHref>
                                <DropdownMenuItem active={pathname === child.href}>
                                    {child.label}
                                </DropdownMenuItem>
                            </Link>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Link href={item.href || "#"} passHref>
            <Button
                variant="ghost"
                className={cn(
                    "text-sm font-medium",
                    isActive && "bg-accent text-accent-foreground"
                )}
            >
                {item.label}
            </Button>
        </Link>
    );
}


export function Header() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      router.push('/login');
      router.refresh();
      toast({ title: 'Logged out successfully.' });
    } else {
      toast({ variant: 'destructive', title: 'Logout failed.' });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Zemen Bank" width={32} height={32} />
            <span className="text-lg font-semibold">
              Zemen Admin
            </span>
        </div>
        <nav className="hidden md:flex items-center gap-1 ml-6">
            {menu.map((item, index) => (
               <NavMenuItem key={index} item={item} />
            ))}
        </nav>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://i.pravatar.cc/150?u=admin-formal" alt="Admin User" />
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
