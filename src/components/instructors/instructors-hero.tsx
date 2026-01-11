import Link from "next/link";
import { Button } from "@/components/ui/button";

export const InstructorsHero = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Para expertos, coaches, academias y empresas
          </span>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Comparte tu conocimiento. Crea y vende tus cursos en Cursumi
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            Publica cursos virtuales o presenciales, conecta con estudiantes
            reales, gestiona pagos y crea experiencias memorables sin
            complicaciones técnicas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#convertir">
              <Button size="lg">Convertirme en instructor</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                Ver cómo funciona
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

