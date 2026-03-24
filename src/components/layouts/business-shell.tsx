"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

import {
  LayoutDashboard,
  Users,
  UsersRound,
  BookOpenCheck,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";

const businessNavItems = [
  { title: "Dashboard", href: "/business/dashboard", icon: LayoutDashboard },
  { title: "Empleados", href: "/business/dashboard/employees", icon: Users },
  { title: "Equipos", href: "/business/dashboard/teams", icon: UsersRound },
  { title: "Cursos", href: "/business/dashboard/courses", icon: BookOpenCheck },
  { title: "Materiales", href: "/business/dashboard/materials", icon: FileText },
  { title: "Métricas", href: "/business/dashboard/metrics", icon: BarChart3 },
  { title: "Suscripción", href: "/business/dashboard/subscription", icon: CreditCard },
  { title: "Configuración", href: "/business/dashboard/settings", icon: Settings },
];

interface BusinessShellProps {
  userName: string;
  userInitials: string;
  userImage?: string | null;
  orgName: string;
  children: ReactNode;
}

export function BusinessShell({
  userName,
  userInitials,
  userImage,
  children,
}: BusinessShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={businessNavItems} title="Cursumi Business" />
      <SidebarInset>
        <DashboardHeader
          profileHref="/business/dashboard/settings"
          user={{ name: userName, initials: userInitials, imageUrl: userImage }}
        />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          <div className="flex w-full flex-1 flex-col gap-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
