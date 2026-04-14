import Link from "next/link";

export const metadata = {
  title: "Sin conexión · Cursumi",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl">📡</div>
      <h1 className="text-2xl font-semibold text-foreground">Sin conexión a internet</h1>
      <p className="max-w-sm text-muted-foreground">
        Parece que no tienes conexión. Las lecciones que visitaste antes siguen disponibles
        si regresaste a ellas. Conéctate de nuevo para acceder al contenido nuevo.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Intentar de nuevo
      </Link>
    </main>
  );
}
