import { Globe, CalendarDays, MonitorPlay, BadgeCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Descubrir",
    description:
      "Filtra por modalidad, nivel y ciudad para encontrar la formación ideal.",
    icon: Globe,
  },
  {
    number: "02",
    title: "Inscribirse",
    description:
      "Reserva tu lugar con un checkout sencillo y opciones de pago local.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Aprender",
    description:
      "Accede al contenido virtual o asiste a sesiones presenciales con soporte continuo.",
    icon: MonitorPlay,
  },
  {
    number: "04",
    title: "Certificarte",
    description:
      "Recibe tu certificado digital que valida tu nuevo conocimiento.",
    icon: BadgeCheck,
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Cómo funciona
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          4 pasos hacia tu certificación
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-base text-muted-foreground">
          Un flujo claro, sin fricciones. Desde que descubres un curso hasta que
          recibes tu certificado.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="group relative flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Big step number (decorative) */}
              <span
                aria-hidden
                className="absolute top-4 right-5 text-6xl font-black leading-none text-primary/8 transition-colors duration-300 group-hover:text-primary/14 select-none"
              >
                {step.number}
              </span>

              {/* Icon */}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20">
                <Icon className="h-5 w-5" aria-hidden />
              </span>

              {/* Step label */}
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Paso {step.number}
              </p>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
