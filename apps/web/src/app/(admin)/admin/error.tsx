"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const isEnvError = (msg: string) =>
  /DATABASE_URL|variables de entorno|environment/i.test(msg);

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

  const showDetail = typeof window !== "undefined" && (isEnvError(error.message) || process.env.NODE_ENV === "development");
  const isEnv = isEnvError(error.message);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-foreground">Error al cargar el panel</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {isEnv
          ? "Falta configurar la base de datos en el servidor (DATABASE_URL). Revisa las variables de entorno en Vercel."
          : "No se pudo cargar la página de administración. Prueba de nuevo o inicia sesión otra vez."}
      </p>
      {showDetail && (
        <pre className="max-w-lg overflow-auto rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
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
