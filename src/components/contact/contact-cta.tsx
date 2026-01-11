import Link from "next/link";
import { Button } from "@/components/ui/button";

export const ContactCTA = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          ¿Listo para empezar?
        </p>
        <h2 className="text-3xl font-bold text-foreground">
          ¿Listo para empezar tu camino en Cursumi?
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/courses">
            <Button size="lg">Explorar cursos</Button>
          </Link>
          <Link href="/instructors">
            <Button variant="outline" size="lg">
              Convertirme en instructor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

