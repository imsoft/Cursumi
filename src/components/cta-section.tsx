import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-violet-600 to-purple-700 px-8 py-16 text-center shadow-2xl shadow-primary/30">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/4 h-56 w-56 rounded-full bg-white/6 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
            <Sparkles className="h-7 w-7 text-white" aria-hidden />
          </div>

          {/* Copy */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              ¿Listo para el siguiente paso?
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Lanza tu próximo curso con Cursumi
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
              Publica tu curso presencial u online y deja que nuestro equipo te
              acompañe en la promoción, logística y certificación.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold shadow-lg"
              >
                Empezar ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                className="border border-white/25 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white"
              >
                Hablar con un asesor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
