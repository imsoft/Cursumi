"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";

import {
  LayoutDashboard,
  Users,
  UsersRound,
  BookOpenCheck,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  AlertTriangle,
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
  /** Si la suscripción no está activa, se muestra el banner para activar el plan. */
  subscriptionActive?: boolean;
  children: ReactNode;
}

export function BusinessShell({
  userName,
  userInitials,
  userImage,
  subscriptionActive,
  children,
}: BusinessShellProps) {
  const pathname = usePathname();
  // No mostrar el banner en la propia página de suscripción (ahí ya se paga).
  const showActivateBanner =
    !subscriptionActive && pathname !== "/business/dashboard/subscription";

  return (
    <SidebarProvider>
      <AppSidebar navItems={businessNavItems} title="Cursumi Business" />
      <SidebarInset>
        <DashboardHeader
          profileHref="/business/dashboard/settings"
          user={{ name: userName, initials: userInitials, imageUrl: userImage }}
        />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {showActivateBanner && (
            <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Tu plan está pendiente de pago</p>
                  <p className="text-sm opacity-90">
                    Activa tu suscripción para invitar empleados, asignar cursos y dar
                    acceso a tu equipo.
                  </p>
                </div>
              </div>
              <Link href="/business/dashboard/subscription" className="shrink-0">
                <Button size="sm">Activar plan</Button>
              </Link>
            </div>
          )}
          <div className="flex w-full flex-1 flex-col gap-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
