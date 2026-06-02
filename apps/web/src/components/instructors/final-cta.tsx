import Link from "next/link";
import { Button } from "@/components/ui/button";

export const InstructorsFinalCTA = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary/5 p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Empieza hoy
        </p>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Empieza a enseñar hoy. Crea tu primer curso en minutos.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="#convertir">
            <Button size="lg" className="rounded-full">
              Crear cuenta de instructor
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg" className="rounded-full">
              Ver todos los cursos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

