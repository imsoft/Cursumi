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
  BookOpenCheck,
  PlusCircle,
  UserCircle,
  DollarSign,
  BarChart3,
} from "lucide-react";

const instructorNavItems = [
  {
    title: "Dashboard",
    href: "/instructor",
    icon: LayoutDashboard,
  },
  {
    title: "Mis cursos",
    href: "/instructor/courses",
    icon: BookOpenCheck,
  },
  {
    title: "Crear curso",
    href: "/instructor/courses/new",
    icon: PlusCircle,
  },
  {
    title: "Ingresos",
    href: "/instructor/earnings",
    icon: DollarSign,
  },
  {
    title: "Analíticas",
    href: "/instructor/analytics",
    icon: BarChart3,
  },
  {
    title: "Perfil",
    href: "/instructor/profile",
    icon: UserCircle,
  },
];

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={instructorNavItems} title="Cursumi Instructor" />
      <SidebarInset>
        <DashboardHeader
          user={{ name: "Brandon", initials: "BG" }}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
