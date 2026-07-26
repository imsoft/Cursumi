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
  Newspaper,
  Building2,
  Scale,
} from "lucide-react";

const studentSections = [
  {
    label: "General",
    items: [{ title: "Inicio", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Mi aprendizaje",
    items: [
      { title: "Mis cursos", href: "/dashboard/my-courses", icon: BookOpenCheck },
      { title: "Guardados", href: "/dashboard/wishlist", icon: Heart },
      { title: "Mis notas", href: "/dashboard/notes", icon: BookOpen },
      { title: "Certificados", href: "/dashboard/certificates", icon: Award },
    ],
  },
  {
    label: "Descubrir",
    items: [
      { title: "Explorar cursos", href: "/dashboard/explore", icon: Search },
      { title: "Blog", href: "/dashboard/blog", icon: Newspaper },
      { title: "Juegos", href: "/dashboard/games", icon: Gamepad2 },
    ],
  },
  {
    label: "Mi cuenta",
    items: [
      { title: "Referidos", href: "/dashboard/referral", icon: Gift },
      { title: "Cuenta", href: "/dashboard/account", icon: UserCircle },
      { title: "Ser instructor", href: "/dashboard/become-instructor", icon: GraduationCap },
    ],
  },
];

/** Lista plana — la usa getPageTitle para resolver el título de la página. */
const studentNavItems = studentSections.flatMap((g) => g.items);

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
  "/dashboard/blog": "Blog",
  "/dashboard/become-instructor": "Ser instructor",
  "/dashboard/org-materials": "Materiales",
};

function greetingTitle(userName: string) {
  return `Hola, ${firstNameFromFullName(userName)}`;
}

function getPageTitle(pathname: string | null, userName: string): string {
  if (!pathname) return greetingTitle(userName);
  if (pathname === "/dashboard" || pathname === "/dashboard/") return greetingTitle(userName);
  if (pathname.includes("/what-you-learned")) return "¿Qué aprendiste?";
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
  isOrgAdmin?: boolean;
  /** Solo los firmantes del documento de acuerdos ven el enlace de Gobernanza. */
  showGovernance?: boolean;
}

export function StudentShell({
  userName,
  userInitials,
  userImage,
  children,
  pageTitle: pageTitleProp,
  hasOrg,
  isOrgAdmin,
  showGovernance,
}: StudentShellProps) {
  const pathname = usePathname();
  const pageTitle = pageTitleProp ?? getPageTitle(pathname, userName);
  /** Vista detalle de certificado: al imprimir / guardar PDF se ocultan sidebar y header (globals.css). */
  const isCertificatePrintPage =
    pathname != null && /^\/dashboard\/certificates\/[^/]+$/.test(pathname);

  // "Materiales" solo aplica a quien pertenece a una empresa; el acceso a
  // empresa cambia según sea administrador de la organización o no.
  const businessItem = isOrgAdmin
    ? { title: "Panel de empresa", href: "/business/dashboard", icon: Building2 }
    : { title: "Para empresas", href: "/dashboard/business", icon: Building2 };

  const sections = studentSections.map((group) => {
    if (group.label === "Mi aprendizaje" && hasOrg) {
      return {
        ...group,
        items: [
          ...group.items,
          { title: "Materiales", href: "/dashboard/org-materials", icon: FileText },
        ],
      };
    }
    if (group.label === "Mi cuenta") {
      return {
        ...group,
        items: [
          ...(showGovernance
            ? [{ title: "Gobernanza", href: "/gobernanza", icon: Scale }]
            : []),
          ...group.items,
          businessItem,
        ],
      };
    }
    return group;
  });

  return (
    <SidebarProvider
      className={cn(isCertificatePrintPage && "print-certificate-layout")}
    >
      <AppSidebar sections={sections} title="Cursumi" />
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
