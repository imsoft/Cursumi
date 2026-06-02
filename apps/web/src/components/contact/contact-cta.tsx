import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ContactCTA = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-violet-600 to-purple-700 px-8 py-14 text-center shadow-2xl shadow-primary/25">
        {/* Blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/4 h-48 w-48 rounded-full bg-white/6 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-white/5 blur-3xl"
        />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">
            ¿Listo para empezar?
          </p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Empieza tu camino en Cursumi hoy
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/75">
            Explora cursos, crea tu cuenta gratis o conviértete en instructor y
            comparte tu conocimiento.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/courses">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold shadow-lg"
              >
                Explorar cursos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                className="border border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Crear cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
