import Link from "next/link";
import { Button } from "@/components/ui/button";

export const HowItWorksFinalCTA = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Da el siguiente paso
        </p>
        <h2 className="text-3xl font-bold text-foreground">
          Aprende o comparte tu conocimiento con Cursumi
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Ya sea que busques una ruta de aprendizaje guiada o quieras construir
          tu propia comunidad de estudiantes, Cursumi te da las herramientas para
          avanzar rápido y con impacto.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/courses">
            <Button size="lg" className="rounded-full">
              Explorar cursos
            </Button>
          </Link>
          <Link href="/instructors">
            <Button variant="outline" size="lg" className="rounded-full">
              Publicar mi curso
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

