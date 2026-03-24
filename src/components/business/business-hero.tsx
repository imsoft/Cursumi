import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Cursumi Business
          </div>

          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Capacita a tu equipo
            <br />
            <span className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              sin complicaciones
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-white/70">
            Accede al catálogo de cursos de Cursumi para tu empresa. Asigna
            capacitaciones, mide el progreso de tu equipo y genera certificados
            — todo desde un solo panel.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/contact">
              <Button size="lg" className="gap-2 font-semibold shadow-lg">
                Solicitar demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                Cómo funciona
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-4 text-sm text-white/50">
            <span>Sin permanencia</span>
            <span>Soporte dedicado</span>
            <span>Certificados incluidos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
