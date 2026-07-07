"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar } from "@/components/ui/avatar";
import { ProfilePhotoImg } from "@/components/ui/profile-photo-img";
import { signOut, useSession } from "@/lib/auth-client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Camera, LogOut, X } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const firstName = user?.name ? user.name.split(" ")[0] : "Usuario";

  const handleSignOut = async () => {
    await signOut();
    window.location.assign("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      <SidebarTrigger />
      {(title || description) && (
        <div className="min-w-0 flex-1">
          {title && (
            <span className="block truncate text-lg font-semibold">{title}</span>
          )}
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
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Avatar className="h-10 w-10 overflow-hidden rounded-full text-sm font-semibold">
                {user.imageUrl ? (
                  <ProfilePhotoImg
                    src={user.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.initials
                )}
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-6 bg-card text-card-foreground rounded-[28px] border border-border shadow-2xl flex flex-col items-center relative overflow-hidden">
              {/* Top Row: Email & Close */}
              <div className="w-full flex items-center justify-center relative min-h-6">
                <span className="text-xs text-muted-foreground font-medium select-none truncate max-w-[200px] block">
                  {userEmail}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Large Avatar */}
              <div className="relative mt-6">
                <Avatar className="h-20 w-20 overflow-hidden rounded-full text-xl font-bold ring-4 ring-border shadow-md">
                  {user.imageUrl ? (
                    <ProfilePhotoImg
                      src={user.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.initials
                  )}
                </Avatar>
                <Link
                  href={profileHref}
                  onClick={() => setIsOpen(false)}
                  className="absolute bottom-0 right-0 p-1.5 bg-background rounded-full border border-border shadow-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Greeting */}
              <h3 className="mt-4 text-lg font-medium text-foreground text-center">
                ¡Hola, {firstName}!
              </h3>

              {/* Manage Account Link */}
              <Link
                href={profileHref}
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full text-center py-2 px-6 rounded-full border border-border text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Gestionar tu cuenta de Cursumi
              </Link>

              {/* Cerrar sesión */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-muted/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-sm font-semibold transition-colors animate-fade-in"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>

              {/* Footer links */}
              <div className="mt-6 flex justify-center gap-3 text-[11px] text-muted-foreground">
                <Link href="/privacy" onClick={() => setIsOpen(false)} className="hover:underline">
                  Política de privacidad
                </Link>
                <span>·</span>
                <Link href="/terms" onClick={() => setIsOpen(false)} className="hover:underline">
                  Términos de servicio
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </header>
  );
}

