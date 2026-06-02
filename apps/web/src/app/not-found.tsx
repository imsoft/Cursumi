import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página no encontrada | Cursumi",
  description: "La página que buscas no existe o ha sido movida.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
      <p className="mt-2 text-center text-muted-foreground">
        La página que buscas no existe o ha sido movida.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
