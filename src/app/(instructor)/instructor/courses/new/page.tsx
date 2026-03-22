"use client";

import Link from "next/link";
import { Monitor, MapPin, ArrowRight, Users, Globe, Calendar, Video } from "lucide-react";
import { MODALITY_CONFIG } from "@/lib/modality";

const options = [
  {
    modality: "virtual" as const,
    title: "Curso Virtual",
    description: "Crea un curso online al que los estudiantes puedan acceder desde cualquier lugar del mundo.",
    icon: Monitor,
    href: "/instructor/courses/new/virtual",
    config: MODALITY_CONFIG.virtual,
    features: [
      { icon: Video, text: "Video lecciones y contenido multimedia" },
      { icon: Globe, text: "Accesible desde cualquier lugar" },
      { icon: Users, text: "Sin límite de estudiantes" },
    ],
  },
  {
    modality: "presencial" as const,
    title: "Curso Presencial",
    description: "Crea un curso o taller presencial con fecha, ubicación y capacidad definidas.",
    icon: MapPin,
    href: "/instructor/courses/new/presencial",
    config: MODALITY_CONFIG.presencial,
    features: [
      { icon: MapPin, text: "Ubicación y dirección del evento" },
      { icon: Calendar, text: "Fecha de inicio definida" },
      { icon: Users, text: "Capacidad máxima de estudiantes" },
    ],
  },
];

export default function SelectCourseTypePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">¿Qué tipo de curso quieres crear?</h1>
        <p className="mt-3 text-muted-foreground">
          Elige la modalidad que mejor se adapte a tu contenido y audiencia
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.modality}
              href={opt.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-linear-to-br p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${opt.config.color.border} ${opt.config.color.accent}`}
            >
              {/* Icon */}
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${opt.config.color.bg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`h-7 w-7 ${opt.config.color.text}`} />
              </div>

              {/* Title & description */}
              <h2 className="text-2xl font-bold text-foreground">{opt.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {opt.description}
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {opt.features.map((f) => {
                  const FIcon = f.icon;
                  return (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-foreground">
                      <FIcon className={`h-4 w-4 shrink-0 ${opt.config.color.text}`} />
                      {f.text}
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <div className={`mt-8 flex items-center gap-2 font-semibold ${opt.config.color.text}`}>
                Crear {opt.modality === "virtual" ? "curso virtual" : "curso presencial"}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
