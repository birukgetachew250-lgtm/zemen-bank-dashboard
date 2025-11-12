"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { menu, MenuItem } from "@/lib/menu";

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isSubActive = (children: NonNullable<MenuItem['children']>) => {
    return children.some(child => child.href && isActive(child.href));
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           <span className="text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden truncate">
             Zemen Admin
           </span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {menu.map((item, index) =>
            item.children ? (
              <Collapsible key={index} defaultOpen={item.open || isSubActive(item.children)}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="justify-between"
                      variant={isSubActive(item.children) ? 'default' : 'ghost'}
                      isActive={isSubActive(item.children)}
                      tooltip={item.label}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <item.icon />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent asChild>
                  <SidebarMenuSub>
                    {item.children.map((child, childIndex) => (
                      <SidebarMenuSubItem key={childIndex}>
                        <SidebarMenuSubButton asChild isActive={isActive(child.href || "#")}>
                          <Link href={child.href || "#"}>{child.label}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={index}>
                <Link href={item.href || "#"}>
                  <SidebarMenuButton
                    isActive={isActive(item.href || "#")}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <div className="text-xs text-sidebar-foreground/50 p-4 group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} Zemen Bank
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
