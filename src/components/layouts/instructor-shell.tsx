"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  Gamepad2,
} from "lucide-react";

const instructorNavItems = [
  { title: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { title: "Mis cursos", href: "/instructor/courses", icon: BookOpenCheck },
  { title: "Crear curso", href: "/instructor/courses/new", icon: PlusCircle },
  { title: "Mis juegos", href: "/instructor/games", icon: Gamepad2 },
  { title: "Ingresos", href: "/instructor/earnings", icon: DollarSign },
  { title: "Analíticas", href: "/instructor/analytics", icon: BarChart3 },
  { title: "Perfil", href: "/instructor/profile", icon: UserCircle },
];

const pathnameToTitle: Record<string, string> = {
  "/instructor": "Dashboard",
  "/instructor/courses": "Mis cursos",
  "/instructor/games": "Mis juegos",
  "/instructor/earnings": "Ingresos",
  "/instructor/analytics": "Analíticas",
  "/instructor/profile": "Perfil",
};

function getPageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  const base = pathname.split("/").slice(0, 3).join("/");
  return pathnameToTitle[base] ?? instructorNavItems.find((n) => pathname.startsWith(n.href))?.title ?? "Dashboard";
}

interface InstructorShellProps {
  userName: string;
  userInitials: string;
  children: ReactNode;
}

export function InstructorShell({ userName, userInitials, children }: InstructorShellProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <AppSidebar navItems={instructorNavItems} title="Cursumi Instructor" roleLabel="Panel de instructor" />
      <SidebarInset>
        <DashboardHeader title={pageTitle} user={{ name: userName, initials: userInitials }} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex w-full flex-1 flex-col gap-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
