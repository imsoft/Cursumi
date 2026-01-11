"use client";

import { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
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
} from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Cursos",
    href: "/admin/courses",
    icon: BookOpenCheck,
  },
  {
    title: "Analíticas",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Finanzas",
    href: "/admin/finances",
    icon: DollarSign,
  },
  {
    title: "Simulador",
    href: "/admin/simulator",
    icon: Calculator,
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={adminNavItems} title="Cursumi Admin" />
      <SidebarInset>
        <DashboardHeader
          user={{ name: "Admin", initials: "AD" }}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
