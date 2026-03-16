import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Briefcase } from "lucide-react";

export const HowItWorksHero = () => {
  return (
    <section className="bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
          Plataforma Cursumi
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-foreground sm:text-5xl">
          Simple de entender.{" "}
          <span className="bg-linear-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Poderoso para crecer.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Cursumi conecta estudiantes con cursos virtuales y presenciales.
          Instructores con herramientas para crear, publicar y gestionar. Elige
          tu camino:
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="#estudiantes">
            <Button size="lg" className="gap-2 font-semibold">
              <BookOpen className="h-4 w-4" />
              Soy estudiante
            </Button>
          </Link>
          <Link href="#instructores">
            <Button variant="outline" size="lg" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Soy instructor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
