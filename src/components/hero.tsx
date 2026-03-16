import Link from "next/link";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicStats } from "@/lib/public-stats";

interface HeroProps {
  stats: PublicStats;
}

export const Hero = ({ stats }: HeroProps) => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-background"
    >
      {/* ── Background: radial glow + grid pattern ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Top-center purple glow */}
        <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        {/* Bottom-right accent */}
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-violet-400/8 blur-[100px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
        {/* ── Announcement badge ── */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/6 px-4 py-2 text-xs font-semibold text-primary shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-75" />
            </span>
            Plataforma de formación presencial y online
          </div>
        </div>

        {/* ── Headline ── */}
        <div className="mt-8 text-center">
          <h1 className="text-5xl font-black leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            El conocimiento que
            <br />
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-primary via-violet-500 to-purple-400 bg-clip-text text-transparent">
                cambia carreras
              </span>
              {/* Underline accent */}
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-linear-to-r from-primary/60 via-violet-500/60 to-purple-400/60 blur-[2px]"
              />
            </span>
          </h1>
        </div>

        {/* ── Subtext ── */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Instructores verificados. Cursos virtuales y presenciales.
          Certificados que los empleadores reconocen.
        </p>

        {/* ── CTAs ── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses">
            <Button
              size="lg"
              className="h-13 gap-2 rounded-2xl px-8 text-base font-bold shadow-lg shadow-primary/25"
            >
              Explorar cursos
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="h-13 rounded-2xl px-8 text-base font-semibold"
            >
              Cómo funciona
            </Button>
          </Link>
        </div>

        {/* ── Trust row ── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
            Registro gratuito
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
            Sin tarjeta requerida
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
            Certificado al finalizar
          </span>
        </div>

        {/* ── Stats bar ── */}
        {(stats.studentsCount > 0 || stats.instructorsCount > 0 || stats.citiesCount > 0) && (
          <div className="mx-auto mt-16 max-w-3xl">
            {/* Top separator line */}
            <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
            <div className="flex flex-wrap items-center justify-center divide-x divide-border">
              {stats.studentsCount > 0 && (
                <div className="flex flex-col items-center gap-1 px-8 py-6">
                  <span className="text-3xl font-black tabular-nums text-foreground sm:text-4xl">
                    {stats.studentsCount.toLocaleString()}
                    <span className="text-primary">+</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Estudiantes
                  </span>
                </div>
              )}
              {stats.instructorsCount > 0 && (
                <div className="flex flex-col items-center gap-1 px-8 py-6">
                  <span className="text-3xl font-black tabular-nums text-foreground sm:text-4xl">
                    {stats.instructorsCount}
                    <span className="text-primary">+</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Instructores
                  </span>
                </div>
              )}
              {stats.citiesCount > 0 && (
                <div className="flex flex-col items-center gap-1 px-8 py-6">
                  <span className="text-3xl font-black tabular-nums text-foreground sm:text-4xl">
                    {stats.citiesCount}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Ciudades
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1 px-8 py-6">
                <span className="flex items-center gap-1 text-3xl font-black text-foreground sm:text-4xl">
                  4.8
                  <Star className="h-6 w-6 fill-amber-400 text-amber-400" aria-hidden />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Valoración media
                </span>
              </div>
            </div>
            <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
};
