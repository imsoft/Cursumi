import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const benefits = [
  "Promoción en campañas enfocadas a estudiantes activos",
  "Panel de instructores con métricas en tiempo real",
  "Soporte en la logística para cursos presenciales",
];

export const InstructorSection = () => {
  return (
    <section
      id="instructores"
      className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
    >
      <div className="grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Para instructores
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Publica tu curso en una plataforma centrada en resultados
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Con Cursumi accedes a estudiantes que buscan formación de calidad, tanto en línea como presencial. Recibes acompañamiento desde la publicación hasta la entrega del certificado.
          </p>
          <ul className="space-y-3">
            {benefits.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="mt-1 h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start justify-center gap-3">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            ¿Listo para impactar?
          </p>
          <Link href="#contacto">
            <Button size="lg">Convertirme en instructor</Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Te contactamos en menos de 24h y te guiamos para calibrar precios, logística y validación previa.
          </p>
        </div>
      </div>
    </section>
  );
};

