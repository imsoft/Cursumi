"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface AppSidebarProps {
  navItems: NavItem[];
  title?: string;
  /** Etiqueta del rol (ej. "Panel de alumno") */
  roleLabel?: string;
  footerAction?: React.ReactNode;
}

export function AppSidebar({ navItems, title = "Cursumi", roleLabel, footerAction }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={roleLabel ? `${title} · ${roleLabel}` : title}>
              <Link href={navItems[0]?.href || "/"} className="flex items-center gap-2">
                <div className="hidden aspect-square size-8 items-center justify-center rounded-lg bg-transparent group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8">
                  <Image
                    src="/logos/cursumi.svg"
                    alt="Cursumi"
                    width={32}
                    height={32}
                    className="h-6 w-6 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <Image
                    src="/logos/cursumi.svg"
                    alt="Cursumi"
                    width={120}
                    height={32}
                    className="h-6 w-auto"
                  />
                  {roleLabel && (
                    <span className="mt-0.5 text-xs font-medium text-muted-foreground">{roleLabel}</span>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                // Lógica mejorada para detectar ruta activa
                let isActive = false;
                
                if (pathname === item.href) {
                  // Coincidencia exacta
                  isActive = true;
                } else if (pathname?.startsWith(item.href + "/")) {
                  // Es una subruta
                  // Casos especiales: rutas raíz solo se activan en coincidencia exacta
                  if (item.href === "/dashboard" || item.href === "/instructor") {
                    isActive = false;
                  } else {
                    isActive = true;
                  }
                }
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <Icon />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {footerAction || (
              <SidebarMenuButton size="lg" asChild tooltip="Cerrar sesión">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary group-data-[collapsible=icon]:justify-center"
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
                </Button>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
