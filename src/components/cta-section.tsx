import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 px-6 py-10 shadow-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          ¿Listo para dar el siguiente paso?
        </p>
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
          Lanza tu próximo curso y conecta con estudiantes que valoran la calidad
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Publica tu curso presencial u online en Cursumi y deja que nuestro
          equipo te acompañe en la promoción, logística y certificación.
        </p>
      </div>
      <div className="flex w-full gap-3 sm:flex-col sm:items-end">
        <Link href="#instructores" className="flex-1">
          <Button size="lg" className="w-full justify-center">
            Publicar mi curso
          </Button>
        </Link>
        <Link href="#contacto" className="flex-1">
          <Button variant="outline" size="lg" className="w-full justify-center">
            Hablar con un asesor
          </Button>
        </Link>
      </div>
    </section>
  );
};

