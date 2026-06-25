"use client";

import Link from "next/link";
import { Monitor, ArrowRight, Users, Globe, Calendar, Video, MapPin } from "lucide-react";
import { MODALITY_CONFIG } from "@/lib/modality";

const options = [
  {
    modality: "virtual" as const,
    title: "Curso en video",
    description:
      "Contenido bajo demanda: subes vídeos, textos y actividades; el alumno avanza a su ritmo en la plataforma.",
    icon: Monitor,
    href: "/instructor/courses/new/virtual",
    config: MODALITY_CONFIG.virtual,
    features: [
      { icon: Video, text: "Vídeos y lecciones en la plataforma" },
      { icon: Globe, text: "Sin horario fijo: acceso 24/7" },
      { icon: Users, text: "Progreso y certificado en Cursumi" },
    ],
  },
  {
    modality: "evento" as const,
    title: "Curso por evento",
    description:
      "Sesiones con fecha y hora. Cada sesión puede ser presencial (en sede) o por videollamada (Meet, Zoom…).",
    icon: Calendar,
    href: "/instructor/courses/new/evento",
    config: MODALITY_CONFIG.evento,
    features: [
      { icon: Calendar, text: "Fechas y cupos por sesión" },
      { icon: MapPin, text: "Presencial o videollamada por sesión" },
      { icon: Users, text: "Los alumnos se inscriben a cada sesión" },
    ],
  },
];

export default function SelectCourseTypePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">¿Qué tipo de curso quieres crear?</h1>
        <p className="mt-3 text-muted-foreground">
          Dos tipos: en video para aprender a tu ritmo, o por evento con sesiones en vivo
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.modality}
              href={opt.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-linear-to-br p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${opt.config.color.border} ${opt.config.color.accent}`}
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${opt.config.color.bg} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className={`h-7 w-7 ${opt.config.color.text}`} />
              </div>

              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{opt.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{opt.description}</p>

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

              <div className={`mt-8 flex items-center gap-2 font-semibold ${opt.config.color.text}`}>
                Crear curso
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
