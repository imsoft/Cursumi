"use client";

import { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SessionProvider } from "@/components/auth/session-provider";
import { useAuth } from "@/stores/auth-store";
import {
  LayoutDashboard,
  BookOpenCheck,
  Award,
  Search,
  UserCircle,
} from "lucide-react";

const studentNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mis cursos",
    href: "/dashboard/my-courses",
    icon: BookOpenCheck,
  },
  {
    title: "Certificados",
    href: "/dashboard/certificates",
    icon: Award,
  },
  {
    title: "Explorar cursos",
    href: "/dashboard/explore",
    icon: Search,
  },
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
];

interface StudentLayoutProps {
  children: ReactNode;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  
  // Obtener nombre e iniciales del usuario
  const userName = session?.user?.name || "Usuario";
  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <SidebarProvider>
      <AppSidebar navItems={studentNavItems} title="Cursumi" />
      <SidebarInset>
        <DashboardHeader
          user={{ name: userName, initials: userInitials }}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <SessionProvider requireAuth={true} redirectTo="/login">
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
