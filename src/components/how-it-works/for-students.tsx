import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const studentSteps = [
  {
    step: "01",
    title: "Crear tu cuenta",
    description:
      "Regístrate con correo o redes sociales y configura tu perfil en minutos.",
  },
  {
    step: "02",
    title: "Explorar cursos",
    description:
      "Filtra por modalidad, categoría o ciudad y encuentra el curso perfecto para ti.",
  },
  {
    step: "03",
    title: "Inscribirte y pagar",
    description:
      "Pago local, confirmación inmediata y acceso directo a tu curso.",
  },
  {
    step: "04",
    title: "Aprender y certificarte",
    description:
      "Clases online o presenciales, comunidad activa y certificado digital al terminar.",
  },
];

export const HowItWorksStudents = () => {
  return (
    <section id="estudiantes" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
          Para estudiantes
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          Tu camino al aprendizaje
        </h2>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Cuatro pasos para pasar de cero a certificado sin fricciones.
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-5 md:grid-cols-2">
        {studentSteps.map((step) => (
          <div
            key={step.title}
            className="group flex gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/8"
          >
            <span
              aria-hidden
              className="text-4xl font-black leading-none text-primary/15 transition-colors duration-300 group-hover:text-primary/25 select-none"
            >
              {step.step}
            </span>
            <div>
              <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/courses">
          <Button size="lg" className="gap-2 font-semibold">
            Explorar cursos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};
