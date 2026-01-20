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
  Award,
  Search,
  UserCircle,
} from "lucide-react";

const studentNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mis cursos", href: "/dashboard/my-courses", icon: BookOpenCheck },
  { title: "Certificados", href: "/dashboard/certificates", icon: Award },
  { title: "Explorar cursos", href: "/dashboard/explore", icon: Search },
  { title: "Perfil", href: "/dashboard/profile", icon: UserCircle },
];

interface StudentShellProps {
  userName: string;
  userInitials: string;
  children: ReactNode;
}

export function StudentShell({ userName, userInitials, children }: StudentShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={studentNavItems} title="Cursumi" />
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
