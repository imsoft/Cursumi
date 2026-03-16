import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const instructorSteps = [
  {
    step: "01",
    title: "Crea tu perfil",
    description:
      "Perfil profesional, verificación y configuración de cobro en pocos pasos.",
  },
  {
    step: "02",
    title: "Diseña tu curso",
    description:
      "Título, modalidad, fechas, duración, precio y logística todo desde el panel.",
  },
  {
    step: "03",
    title: "Publica y comparte",
    description:
      "Sube recursos, publica y llega a tu audiencia en redes o eventos.",
  },
  {
    step: "04",
    title: "Gestiona tu comunidad",
    description:
      "Asistencia, mensajes y certificados digitales o físicos para tus alumnos.",
  },
];

export const HowItWorksInstructors = () => {
  return (
    <section id="instructores" className="bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            Para instructores
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Publica y crece con tu comunidad
          </h2>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            Un flujo pensado para poner tus cursos frente a estudiantes reales.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-5 md:grid-cols-2">
          {instructorSteps.map((step) => (
            <div
              key={step.title}
              className="group flex gap-4 rounded-3xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/8"
            >
              <span
                aria-hidden
                className="text-4xl font-black leading-none text-primary/15 transition-colors duration-300 group-hover:text-primary/25 select-none"
              >
                {step.step}
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              Publicar mi curso
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
