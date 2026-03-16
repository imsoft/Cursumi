import { Video, Globe, Zap } from "lucide-react";

const modalityCards = [
  {
    title: "Cursos virtuales",
    description:
      "Sesiones en vivo y contenido grabado para aprender a tu ritmo, con soporte continuo de instructores.",
    badge: "Online",
    icon: Video,
    accent: "from-blue-500/8 to-primary/8",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Cursos presenciales",
    description:
      "Experiencias en aula con instructores certificados en ciudades clave de LatAm.",
    badge: "Presencial",
    icon: Globe,
    accent: "from-primary/8 to-violet-500/8",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Talleres intensivos",
    description:
      "Bootcamps y talleres prácticos de corta duración para dominar lo esencial rápido.",
    badge: "Inmersivo",
    icon: Zap,
    accent: "from-orange-500/8 to-yellow-500/8",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
];

export const CourseTypes = () => {
  return (
    <section id="cursos" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Modalidades
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Aprende como tú quieras
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-base text-muted-foreground">
            Tres modalidades de aprendizaje diseñadas para adaptarse a tu ritmo,
            ubicación y objetivos.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {modalityCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-linear-to-br ${card.accent} p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8`}
              >
                {/* Icon */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${card.iconColor}`} aria-hidden />
                </div>

                {/* Badge */}
                <span className="inline-block rounded-full border border-primary/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {card.badge}
                </span>

                {/* Text */}
                <h3 className="mt-3 text-xl font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
