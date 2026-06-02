"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";

interface AuthState {
  session: Session | null;
  isPending: boolean;
  setSession: (session: Session | null) => void;
  setIsPending: (isPending: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isPending: true,
  setSession: (session) => set({ session }),
  setIsPending: (isPending) => set({ isPending }),
}));

/**
 * Hook para usar la sesión de Better Auth con Zustand
 * Sincroniza el estado de Better Auth con el store de Zustand
 */
export function useAuth() {
  const { data: session, isPending } = useSession();
  const setSession = useAuthStore((state) => state.setSession);
  const setIsPending = useAuthStore((state) => state.setIsPending);

  // Sincronizar el estado de Better Auth con Zustand
  useEffect(() => {
    setSession(session || null);
    setIsPending(isPending);
  }, [session, isPending, setSession, setIsPending]);

  // Retornar valores del store de Zustand para acceso reactivo
  const storeSession = useAuthStore((state) => state.session);
  const storeIsPending = useAuthStore((state) => state.isPending);

  return {
    session: storeSession,
    isPending: storeIsPending,
  };
}

