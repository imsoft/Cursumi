import { Building2, BookOpen, UserPlus } from "lucide-react";

const steps = [
  {
    icon: Building2,
    step: "1",
    title: "Crea tu organización",
    description:
      "Registra tu empresa en Cursumi Business y elige tu plan según el número de empleados.",
  },
  {
    icon: BookOpen,
    step: "2",
    title: "Selecciona cursos",
    description:
      "Explora nuestro catálogo y agrega los cursos que necesita tu equipo. También puedes subir materiales propios.",
  },
  {
    icon: UserPlus,
    step: "3",
    title: "Invita a tu equipo",
    description:
      "Envía invitaciones por email. Tus empleados acceden al instante a los cursos asignados y empiezan a aprender.",
  },
];

export function BusinessHowItWorks() {
  return (
    <section id="como-funciona" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
            Tres pasos para empezar
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {s.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
