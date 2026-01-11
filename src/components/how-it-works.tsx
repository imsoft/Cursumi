import { Globe, CalendarDays, MonitorPlay, Verified } from "lucide-react";

const steps = [
  {
    title: "Descubrir cursos",
    description: "Filtra por modalidad, nivel y ciudad para encontrar la formación ideal.",
    icon: Globe,
  },
  {
    title: "Inscribirse",
    description: "Reserva tu lugar con un checkout sencillo y opciones de financiamiento.",
    icon: CalendarDays,
  },
  {
    title: "Tomar el curso",
    description: "Accede al contenido virtual o asiste a sesiones presenciales con soporte continuo.",
    icon: MonitorPlay,
  },
  {
    title: "Obtener certificado",
    description: "Recibe un certificado digital o físico que valida tu nuevo conocimiento.",
    icon: Verified,
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="como-funciona"
      className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
    >
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Cómo funciona
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Navega de forma natural y sin fricciones
        </h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Proceso
                </p>
                <h3 className="text-lg font-semibold text-foreground">
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

