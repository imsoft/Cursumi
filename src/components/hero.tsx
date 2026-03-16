import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicStats } from "@/lib/public-stats";

interface HeroProps {
  stats: PublicStats;
}

export const Hero = ({ stats }: HeroProps) => {
  const hasStats =
    stats.studentsCount > 0 ||
    stats.citiesCount > 0 ||
    stats.instructorsCount > 0;

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 right-0 h-[600px] w-[600px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-[400px] w-[400px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:py-20 lg:flex-row lg:items-center lg:gap-20 lg:py-24">
        {/* ── Left content ── */}
        <div className="flex flex-1 flex-col gap-7">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Formación que transforma
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
            Aprende lo que{" "}
            <span className="bg-linear-to-r from-primary via-violet-500 to-purple-400 bg-clip-text text-transparent">
              importa de verdad
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Cursos virtuales y presenciales con instructores expertos. Formación
            práctica para llevar tus habilidades al siguiente nivel.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/courses">
              <Button size="lg" className="gap-2 px-6 font-semibold">
                Explorar cursos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="px-6">
                Crear cuenta gratis
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {hasStats && (
            <div className="flex flex-wrap gap-6 border-t border-border pt-6">
              {stats.studentsCount > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {stats.studentsCount.toLocaleString()}
                      <span className="text-primary">+</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Estudiantes</p>
                  </div>
                </div>
              )}
              {stats.instructorsCount > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {stats.instructorsCount}
                      <span className="text-primary">+</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Instructores</p>
                  </div>
                </div>
              )}
              {stats.citiesCount > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {stats.citiesCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Ciudades</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: image ── */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-lg">
            {/* Decorative rings */}
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl border border-primary/10"
            />
            <div
              aria-hidden
              className="absolute -inset-8 rounded-3xl border border-primary/5"
            />

            <div className="relative overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.14)]">
              <Image
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
                alt="Estudiantes aprendiendo con Cursumi"
                width={540}
                height={400}
                className="aspect-4/3 w-full object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
            </div>

            {/* Floating badge — bottom left */}
            <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 text-base">
                🎓
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Certificado digital
                </p>
                <p className="text-[0.7rem] text-muted-foreground">
                  Al completar el curso
                </p>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div className="absolute -top-4 -right-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-base">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Aprende a tu ritmo
                </p>
                <p className="text-[0.7rem] text-muted-foreground">
                  Virtual y presencial
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
