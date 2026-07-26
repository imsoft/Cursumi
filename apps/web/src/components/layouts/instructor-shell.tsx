"use client";

import { ReactNode, useEffect, useState } from "react";
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
  Building2,
  Scale,
} from "lucide-react";

const instructorSections = [
  {
    label: "General",
    items: [{ title: "Dashboard", href: "/instructor", icon: LayoutDashboard }],
  },
  {
    label: "Mis cursos",
    items: [
      // La planeación didáctica vive dentro de cada curso (pestaña del workspace),
      // por eso no es un item de nivel superior del sidebar.
      { title: "Mis cursos", href: "/instructor/courses", icon: BookOpenCheck },
      { title: "Crear curso", href: "/instructor/courses/new", icon: PlusCircle },
      { title: "Plantillas", href: "/instructor/templates", icon: FileDown },
    ],
  },
  {
    label: "Enseñanza",
    items: [
      { title: "Pizarrón virtual", href: "/instructor/whiteboard", icon: PenLine },
      { title: "Mis juegos", href: "/instructor/games", icon: Gamepad2 },
      { title: "Blog", href: "/instructor/blog", icon: Newspaper },
    ],
  },
  {
    label: "Negocio",
    items: [
      { title: "Ingresos", href: "/instructor/earnings", icon: DollarSign },
      { title: "Analíticas", href: "/instructor/analytics", icon: BarChart3 },
      { title: "Para empresas", href: "/instructor/business", icon: Building2 },
    ],
  },
  {
    label: "Cuenta",
    items: [{ title: "Perfil", href: "/instructor/profile", icon: UserCircle }],
  },
];

/** Lista plana — la usa getPageTitle para resolver el título de la página. */
const instructorNavItems = instructorSections.flatMap((g) => g.items);

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
  if (pathname.includes("/planning")) return "Planeación didáctica";
  const base = pathname.split("/").slice(0, 3).join("/");
  return pathnameToTitle[base] ?? instructorNavItems.find((n) => pathname.startsWith(n.href))?.title ?? "Dashboard";
}

interface InstructorShellProps {
  userName: string;
  userInitials: string;
  userImage?: string | null;
  children: ReactNode;
  pageTitle?: string;
  /** Solo los firmantes del documento de acuerdos ven el enlace de Gobernanza. */
  showGovernance?: boolean;
}

export function InstructorShell({
  userName,
  userInitials,
  userImage,
  children,
  pageTitle: pageTitleProp,
  showGovernance,
}: InstructorShellProps) {
  const pathname = usePathname();
  // Gobernanza se suma a "Cuenta", antes de Perfil (que cierra el menú).
  const sections = instructorSections.map((group) =>
    showGovernance && group.label === "Cuenta"
      ? {
          ...group,
          items: [
            { title: "Gobernanza", href: "/gobernanza", icon: Scale },
            ...group.items,
          ],
        }
      : group,
  );
  const pageTitle = pageTitleProp ?? getPageTitle(pathname);
  const isWhiteboard = pathname?.startsWith("/instructor/whiteboard") ?? false;

  // Dentro del WebView de la app móvil renderizamos solo el contenido (sin
  // sidebar ni header web), para que la sección de planeación se sienta nativa.
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView
    ) {
      setEmbedded(true);
    }
  }, []);

  if (embedded) {
    return <div className="min-h-svh bg-background p-4 md:p-6">{children}</div>;
  }

  return (
    <SidebarProvider
      className={cn(isWhiteboard && "h-svh max-h-svh overflow-hidden")}
    >
      <AppSidebar sections={sections} title="Cursumi Instructor" />
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
