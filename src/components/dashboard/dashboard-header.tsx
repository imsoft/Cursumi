"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
  };
}

export function DashboardHeader({
  title,
  description,
  action,
  user,
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
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="!h-10 !w-10 !rounded-full !p-0 hover:!bg-muted/50 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                <Avatar className="h-10 w-10 rounded-full">{user.initials}</Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account?tab=profile" className="block w-full">
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

