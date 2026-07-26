"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Newspaper,
  Building2,
  ShieldCheck,
  Scale,
} from "lucide-react";

const adminSections = [
  {
    label: "General",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Contenido",
    items: [
      { title: "Cursos", href: "/admin/courses", icon: BookOpenCheck },
      { title: "Categorías", href: "/admin/categories", icon: Tag },
      { title: "Blog", href: "/admin/blog", icon: Newspaper },
      { title: "Plantillas", href: "/admin/templates", icon: FileDown },
      { title: "Constancia", href: "/admin/certificate-preview", icon: Award },
      { title: "Pizarrón virtual", href: "/admin/whiteboard", icon: PenLine },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { title: "Usuarios", href: "/admin/users", icon: Users },
      { title: "Solicitudes", href: "/admin/instructor-applications", icon: GraduationCap },
      { title: "Empresas", href: "/admin/business", icon: Building2 },
      { title: "Reseñas", href: "/admin/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { title: "Finanzas", href: "/admin/finances", icon: DollarSign },
      { title: "Cupones", href: "/admin/coupons", icon: Ticket },
      { title: "Simulador", href: "/admin/simulator", icon: Calculator },
    ],
  },
  {
    label: "Análisis",
    items: [
      { title: "KPIs", href: "/admin/kpis", icon: Target },
      { title: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "AI Lab", href: "/admin/ai-lab", icon: Sparkles },
      { title: "Auditoría", href: "/admin/audit-logs", icon: ShieldCheck },
      { title: "Configuración", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface AdminShellProps {
  userName: string;
  userInitials: string;
  userImage?: string | null;
  /** Solo los firmantes del documento de acuerdos ven el enlace de Gobernanza. */
  showGovernance?: boolean;
  children: ReactNode;
}

export function AdminShell({
  userName,
  userInitials,
  userImage,
  showGovernance,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  // Gobernanza se suma a "Sistema", antes de Configuración (que cierra el menú).
  const sections = adminSections.map((group) =>
    showGovernance && group.label === "Sistema"
      ? {
          ...group,
          items: [
            ...group.items.slice(0, -1),
            { title: "Gobernanza", href: "/gobernanza", icon: Scale },
            ...group.items.slice(-1),
          ],
        }
      : group,
  );
  const isWhiteboard = pathname?.startsWith("/admin/whiteboard") ?? false;
  const headerTitle = isWhiteboard ? "Pizarrón virtual" : undefined;

  return (
    <SidebarProvider
      className={cn(isWhiteboard && "h-svh max-h-svh overflow-hidden")}
    >
      <AppSidebar sections={sections} title="Cursumi Admin" />
      <SidebarInset className={cn(isWhiteboard && "min-h-0 overflow-hidden")}>
        <DashboardHeader
          title={headerTitle}
          profileHref="/admin/settings"
          user={{ name: userName, initials: userInitials, imageUrl: userImage }}
        />
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8",
            isWhiteboard && "overflow-hidden",
          )}
        >
          <div
            className={cn(
              "flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6",
              isWhiteboard && "overflow-hidden",
            )}
          >
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
