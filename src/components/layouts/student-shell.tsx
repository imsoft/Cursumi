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
  Award,
  Search,
  UserCircle,
  GraduationCap,
  Gamepad2,
} from "lucide-react";

const studentNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mis cursos", href: "/dashboard/my-courses", icon: BookOpenCheck },
  { title: "Certificados", href: "/dashboard/certificates", icon: Award },
  { title: "Explorar cursos", href: "/dashboard/explore", icon: Search },
  { title: "Juegos", href: "/dashboard/games", icon: Gamepad2 },
  { title: "Cuenta", href: "/dashboard/account", icon: UserCircle },
  { title: "Ser instructor", href: "/dashboard/become-instructor", icon: GraduationCap },
];

const pathnameToTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/my-courses": "Mis cursos",
  "/dashboard/certificates": "Certificados",
  "/dashboard/explore": "Explorar cursos",
  "/dashboard/games": "Juegos",
  "/dashboard/account": "Cuenta",
  "/dashboard/profile": "Perfil",
  "/dashboard/settings": "Configuración",
  "/dashboard/become-instructor": "Ser instructor",
};

function getPageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  const base = pathname.split("/").slice(0, 4).join("/");
  return pathnameToTitle[base] ?? studentNavItems.find((n) => pathname.startsWith(n.href))?.title ?? "Dashboard";
}

interface StudentShellProps {
  userName: string;
  userInitials: string;
  children: ReactNode;
}

export function StudentShell({ userName, userInitials, children }: StudentShellProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <AppSidebar navItems={studentNavItems} title="Cursumi" roleLabel="Panel de alumno" />
      <SidebarInset>
        <DashboardHeader title={pageTitle} user={{ name: userName, initials: userInitials }} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          <div className="flex w-full flex-1 flex-col gap-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
