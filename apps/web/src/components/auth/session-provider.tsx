"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth-store";

interface SessionProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function SessionProvider({ 
  children, 
  requireAuth = false,
  redirectTo = "/login" 
}: SessionProviderProps) {
  const { session, isPending } = useAuth();
  const router = useRouter();
  const shouldRedirect = requireAuth && !isPending && !session;

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return null; // El redirect se maneja en el useEffect
  }

  return <>{children}</>;
}
