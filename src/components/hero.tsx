import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:py-16 lg:flex-row lg:items-center lg:gap-16"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Formación que se adapta a ti
        </p>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
          Cursos virtuales y presenciales para aprender lo que importa de verdad
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Aprende con instructores expertos. Cursos online y presenciales para llevar tus habilidades al siguiente nivel.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="inline-flex">
            <Button size="lg">Explorar cursos</Button>
          </Link>
          <Link href="#instructores" className="inline-flex">
            <Button variant="outline" size="lg">
              Publicar mi curso
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-lg rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
              alt="Estudiantes aprendiendo en línea"
              width={520}
              height={360}
              className="h-72 w-full object-cover"
              priority
            />
          </div>
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p>+1200 estudiantes activos</p>
            <p>120 ciudades con cursos presenciales</p>
            <p>100+ instructores verificados</p>
          </div>
        </div>
      </div>
    </section>
  );
};

