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
  Users,
  BookOpenCheck,
  Settings,
  BarChart3,
  DollarSign,
  Calculator,
  Tag,
  GraduationCap,
  Target,
  MessageSquare,
  Ticket,
  FileDown,
  Award,
  PenLine,
  Sparkles,
} from "lucide-react";

const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Pizarrón virtual", href: "/admin/whiteboard", icon: PenLine },
  { title: "Usuarios", href: "/admin/users", icon: Users },
  { title: "Solicitudes", href: "/admin/instructor-applications", icon: GraduationCap },
  { title: "Cursos", href: "/admin/courses", icon: BookOpenCheck },
  { title: "Categorías", href: "/admin/categories", icon: Tag },
  { title: "Reseñas", href: "/admin/reviews", icon: MessageSquare },
  { title: "Cupones", href: "/admin/coupons", icon: Ticket },
  { title: "KPIs", href: "/admin/kpis", icon: Target },
  { title: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
  { title: "Finanzas", href: "/admin/finances", icon: DollarSign },
  { title: "Simulador", href: "/admin/simulator", icon: Calculator },
  { title: "Plantillas", href: "/admin/templates", icon: FileDown },
  { title: "Constancia", href: "/admin/certificate-preview", icon: Award },
  { title: "AI Lab", href: "/admin/ai-lab", icon: Sparkles },
  { title: "Configuración", href: "/admin/settings", icon: Settings },
];

interface AdminShellProps {
  userName: string;
  userInitials: string;
  userImage?: string | null;
  children: ReactNode;
}

export function AdminShell({ userName, userInitials, userImage, children }: AdminShellProps) {
  const pathname = usePathname();
  const headerTitle = pathname?.startsWith("/admin/whiteboard") ? "Pizarrón virtual" : undefined;

  return (
    <SidebarProvider>
      <AppSidebar navItems={adminNavItems} title="Cursumi Admin" />
      <SidebarInset>
        <DashboardHeader
          title={headerTitle}
          profileHref="/admin/settings"
          user={{ name: userName, initials: userInitials, imageUrl: userImage }}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
