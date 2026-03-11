"use client";

import { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  Settings,
  BarChart3,
  DollarSign,
  Calculator,
  Tag,
} from "lucide-react";

const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Usuarios", href: "/admin/users", icon: Users },
  { title: "Cursos", href: "/admin/courses", icon: BookOpenCheck },
  { title: "Categorías", href: "/admin/categories", icon: Tag },
  { title: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
  { title: "Finanzas", href: "/admin/finances", icon: DollarSign },
  { title: "Simulador", href: "/admin/simulator", icon: Calculator },
  { title: "Configuración", href: "/admin/settings", icon: Settings },
];

interface AdminShellProps {
  userName: string;
  userInitials: string;
  children: ReactNode;
}

export function AdminShell({ userName, userInitials, children }: AdminShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={adminNavItems} title="Cursumi Admin" roleLabel="Panel de administración" />
      <SidebarInset>
        <DashboardHeader user={{ name: userName, initials: userInitials }} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex w-full flex-1 flex-col gap-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
