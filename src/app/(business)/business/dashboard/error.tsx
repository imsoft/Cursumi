"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BusinessDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Business dashboard error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-foreground">Error en el panel empresarial</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        No se pudo cargar esta sección. Intenta de nuevo o regresa al panel principal.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-lg overflow-auto rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <Button variant="default" onClick={reset}>
          Reintentar
        </Button>
        <Button asChild variant="outline">
          <Link href="/business/dashboard">Ir al panel</Link>
        </Button>
      </div>
    </div>
  );
}
