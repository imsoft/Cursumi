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
  BookOpenCheck,
  PlusCircle,
  UserCircle,
  DollarSign,
  BarChart3,
  Gamepad2,
  FileDown,
  PenLine,
  Newspaper,
} from "lucide-react";

const instructorNavItems = [
  { title: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { title: "Mis cursos", href: "/instructor/courses", icon: BookOpenCheck },
  { title: "Crear curso", href: "/instructor/courses/new", icon: PlusCircle },
  { title: "Pizarrón virtual", href: "/instructor/whiteboard", icon: PenLine },
  { title: "Mis juegos", href: "/instructor/games", icon: Gamepad2 },
  { title: "Ingresos", href: "/instructor/earnings", icon: DollarSign },
  { title: "Analíticas", href: "/instructor/analytics", icon: BarChart3 },
  { title: "Blog", href: "/instructor/blog", icon: Newspaper },
  { title: "Plantillas", href: "/instructor/templates", icon: FileDown },
  { title: "Perfil", href: "/instructor/profile", icon: UserCircle },
];

const pathnameToTitle: Record<string, string> = {
  "/instructor": "Dashboard",
  "/instructor/courses": "Mis cursos",
  "/instructor/games": "Mis juegos",
  "/instructor/earnings": "Ingresos",
  "/instructor/analytics": "Analíticas",
  "/instructor/blog": "Blog",
  "/instructor/templates": "Plantillas",
  "/instructor/profile": "Perfil",
};

function getPageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  if (pathname.includes("/anonymous-questions")) return "Preguntas anónimas";
  if (pathname.startsWith("/instructor/whiteboard")) return "Pizarrón virtual";
  const base = pathname.split("/").slice(0, 3).join("/");
  return pathnameToTitle[base] ?? instructorNavItems.find((n) => pathname.startsWith(n.href))?.title ?? "Dashboard";
}

interface InstructorShellProps {
  userName: string;
  userInitials: string;
  userImage?: string | null;
  children: ReactNode;
  pageTitle?: string;
}

export function InstructorShell({
  userName,
  userInitials,
  userImage,
  children,
  pageTitle: pageTitleProp,
}: InstructorShellProps) {
  const pathname = usePathname();
  const pageTitle = pageTitleProp ?? getPageTitle(pathname);
  const isWhiteboard = pathname?.startsWith("/instructor/whiteboard") ?? false;

  return (
    <SidebarProvider
      className={cn(isWhiteboard && "h-svh max-h-svh overflow-hidden")}
    >
      <AppSidebar navItems={instructorNavItems} title="Cursumi Instructor" />
      <SidebarInset className={cn(isWhiteboard && "min-h-0 overflow-hidden")}>
        <DashboardHeader
          title={pageTitle}
          profileHref="/instructor/profile"
          user={{ name: userName, initials: userInitials, imageUrl: userImage }}
        />
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8",
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
