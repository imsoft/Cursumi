"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  user?: {
    name: string;
    initials: string;
    /** Foto de perfil (sesión / BD); si no hay, se muestran iniciales */
    imageUrl?: string | null;
  };
  /** Enlace del ítem "Perfil" del menú (según rol: alumno, instructor, admin) */
  profileHref?: string;
}

export function DashboardHeader({
  title,
  description,
  action,
  user,
  profileHref = "/dashboard/account?tab=profile",
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      <SidebarTrigger />
      {(title || description) && (
        <div className="flex-1">
          {title && <span className="text-lg font-semibold">{title}</span>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {action && <div className="ml-auto">{action}</div>}
      {user && (
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />
          <DropdownMenu>
            {/* Sin asChild: el trigger debe ser el <button> nativo para que el ref del menú funcione */}
            <DropdownMenuTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Avatar className="h-10 w-10 overflow-hidden rounded-full text-sm font-semibold">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL OAuth o Cloudinary
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.initials
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={profileHref} className="block w-full">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onSelect={handleSignOut}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}

