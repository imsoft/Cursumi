"use client";

import { useEffect, useState, ReactNode } from "react";
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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isPending) {
      setIsChecking(false);
      if (requireAuth && !session) {
        router.push(redirectTo);
      }
    }
  }, [session, isPending, requireAuth, redirectTo, router]);

  if (isPending || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !session) {
    return null; // El redirect se maneja en el useEffect
  }

  return <>{children}</>;
}

