"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-foreground">Error al cargar el panel</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        No se pudo cargar la página de administración. Prueba de nuevo o inicia sesión otra vez.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="default">
          <Link href="/login">Ir a iniciar sesión</Link>
        </Button>
        <Button variant="outline" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
