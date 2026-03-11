import Link from "next/link";
import { Button } from "@/components/ui/button";

export const HowItWorksHero = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
        Plataforma Cursumi
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        ¿Cómo funciona Cursumi?
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
        Cursumi conecta estudiantes con cursos virtuales y presenciales. Los instructores tienen herramientas para crear, publicar y gestionar. Elige tu camino:
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="#estudiantes">
          <Button size="lg" className="rounded-full">
            Para estudiantes
          </Button>
        </Link>
        <Link href="#instructores">
          <Button variant="outline" size="lg" className="rounded-full">
            Para instructores
          </Button>
        </Link>
      </div>
    </section>
  );
};

