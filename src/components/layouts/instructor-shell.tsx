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
  BookOpenCheck,
  PlusCircle,
  UserCircle,
  DollarSign,
  BarChart3,
} from "lucide-react";

const instructorNavItems = [
  { title: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { title: "Mis cursos", href: "/instructor/courses", icon: BookOpenCheck },
  { title: "Crear curso", href: "/instructor/courses/new", icon: PlusCircle },
  { title: "Ingresos", href: "/instructor/earnings", icon: DollarSign },
  { title: "Analíticas", href: "/instructor/analytics", icon: BarChart3 },
  { title: "Perfil", href: "/instructor/profile", icon: UserCircle },
];

interface InstructorShellProps {
  userName: string;
  userInitials: string;
  children: ReactNode;
}

export function InstructorShell({ userName, userInitials, children }: InstructorShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={instructorNavItems} title="Cursumi Instructor" />
      <SidebarInset>
        <DashboardHeader user={{ name: userName, initials: userInitials }} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
