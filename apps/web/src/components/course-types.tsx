"use client";

import { motion, type Variants } from "framer-motion";
import { Video, Calendar } from "lucide-react";

const modalityCards = [
  {
    title: "Cursos en video",
    description:
      "Contenido grabado y actividades para aprender a tu ritmo, cuando quieras, con certificado al terminar.",
    badge: "A tu ritmo",
    icon: Video,
    accent: "from-blue-500/8 to-blue-600/8",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBorder: "border-blue-500/25",
    badgeText: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Cursos por evento",
    description:
      "Sesiones con fecha y hora. Cada sesión puede ser presencial en sede o por videollamada (Meet, Zoom…).",
    badge: "En vivo",
    icon: Calendar,
    accent: "from-violet-500/8 to-violet-600/8",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    badgeBorder: "border-violet-500/25",
    badgeText: "text-violet-600 dark:text-violet-400",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const headerVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export const CourseTypes = () => {
  return (
    <section id="cursos" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-2 text-center"
          variants={headerVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Modalidades
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Aprende como tú quieras
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-base text-muted-foreground">
            Dos tipos de curso diseñados para adaptarse a tu ritmo,
            ubicación y objetivos.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="mt-10 grid gap-6 md:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {modalityCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={cardVariant}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-linear-to-br ${card.accent} p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8`}
              >
                {/* Icon */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${card.iconColor}`} aria-hidden />
                </div>

                {/* Badge */}
                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${card.badgeBorder} ${card.badgeText}`}>
                  {card.badge}
                </span>

                {/* Text */}
                <h3 className="mt-3 text-xl font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
