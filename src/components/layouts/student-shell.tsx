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
import { firstNameFromFullName } from "@/lib/utils";

import {
  LayoutDashboard,
  BookOpenCheck,
  Award,
  Search,
  UserCircle,
  GraduationCap,
  Gamepad2,
  FileText,
  BookOpen,
  Heart,
  Gift,
} from "lucide-react";

const studentNavItems = [
  { title: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mis cursos", href: "/dashboard/my-courses", icon: BookOpenCheck },
  { title: "Guardados", href: "/dashboard/wishlist", icon: Heart },
  { title: "Mis notas", href: "/dashboard/notes", icon: BookOpen },
  { title: "Certificados", href: "/dashboard/certificates", icon: Award },
  { title: "Explorar cursos", href: "/dashboard/explore", icon: Search },
  { title: "Juegos", href: "/dashboard/games", icon: Gamepad2 },
  { title: "Referidos", href: "/dashboard/referral", icon: Gift },
  { title: "Cuenta", href: "/dashboard/account", icon: UserCircle },
  { title: "Ser instructor", href: "/dashboard/become-instructor", icon: GraduationCap },
];

const pathnameToTitle: Record<string, string> = {
  "/dashboard/my-courses": "Mis cursos",
  "/dashboard/wishlist": "Guardados",
  "/dashboard/notes": "Mis notas",
  "/dashboard/certificates": "Certificados",
  "/dashboard/explore": "Explorar cursos",
  "/dashboard/games": "Juegos",
  "/dashboard/account": "Cuenta",
  "/dashboard/profile": "Perfil",
  "/dashboard/settings": "Configuración",
  "/dashboard/become-instructor": "Ser instructor",
  "/dashboard/org-materials": "Materiales",
};

function greetingTitle(userName: string) {
  return `Hola, ${firstNameFromFullName(userName)}`;
}

function getPageTitle(pathname: string | null, userName: string): string {
  if (!pathname) return greetingTitle(userName);
  if (pathname === "/dashboard" || pathname === "/dashboard/") return greetingTitle(userName);
  if (pathname.includes("/que-aprendiste")) return "¿Qué aprendiste?";
  const base = pathname.split("/").slice(0, 4).join("/");
  return (
    pathnameToTitle[base] ??
    studentNavItems.find((n) => pathname.startsWith(n.href))?.title ??
    greetingTitle(userName)
  );
}

interface StudentShellProps {
  userName: string;
  userInitials: string;
  userImage?: string | null;
  children: ReactNode;
  pageTitle?: string;
  hasOrg?: boolean;
}

export function StudentShell({
  userName,
  userInitials,
  userImage,
  children,
  pageTitle: pageTitleProp,
  hasOrg,
}: StudentShellProps) {
  const pathname = usePathname();
  const pageTitle = pageTitleProp ?? getPageTitle(pathname, userName);
  /** Vista detalle de certificado: al imprimir / guardar PDF se ocultan sidebar y header (globals.css). */
  const isCertificatePrintPage =
    pathname != null && /^\/dashboard\/certificates\/[^/]+$/.test(pathname);

  const navItems = hasOrg
    ? [...studentNavItems.slice(0, 3), { title: "Materiales", href: "/dashboard/org-materials", icon: FileText }, ...studentNavItems.slice(3)]
    : studentNavItems;

  return (
    <SidebarProvider
      className={cn(isCertificatePrintPage && "print-certificate-layout")}
    >
      <AppSidebar navItems={navItems} title="Cursumi" />
      <SidebarInset>
        <DashboardHeader
          title={pageTitle}
          profileHref="/dashboard/account?tab=profile"
          user={{ name: userName, initials: userInitials, imageUrl: userImage }}
        />
        <div
          className={cn(
            "flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8",
            isCertificatePrintPage && "print:p-0 print:gap-0",
          )}
        >
          <div className="flex w-full flex-1 flex-col gap-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
