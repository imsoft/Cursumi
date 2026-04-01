"use client";

import Link from "next/link";
import { Monitor, MapPin, ArrowRight, Users, Globe, Calendar, Video } from "lucide-react";
import { MODALITY_CONFIG } from "@/lib/modality";

const options = [
  {
    modality: "virtual" as const,
    title: "Curso virtual (vídeo)",
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
    modality: "live" as const,
    title: "Clases en vivo (enlace)",
    description:
      "Sesiones en fecha y hora concretas. Compartes el enlace de Meet, Zoom u otra videollamada por sesión.",
    icon: Video,
    href: "/instructor/courses/new/live",
    config: MODALITY_CONFIG.live,
    features: [
      { icon: Video, text: "Enlace de reunión por sesión" },
      { icon: Calendar, text: "Fechas y cupos por sesión" },
      { icon: Users, text: "Los alumnos se inscriben a cada cohorte" },
    ],
  },
  {
    modality: "presencial" as const,
    title: "Curso presencial",
    description:
      "Taller o curso en sede física: defines lugar, fechas y aforo; los alumnos asisten en persona.",
    icon: MapPin,
    href: "/instructor/courses/new/presencial",
    config: MODALITY_CONFIG.presencial,
    features: [
      { icon: MapPin, text: "Ciudad y dirección del evento" },
      { icon: Calendar, text: "Sesiones con fecha y hora" },
      { icon: Users, text: "Capacidad por sesión" },
    ],
  },
];

export default function SelectCourseTypePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">¿Qué tipo de curso quieres crear?</h1>
        <p className="mt-3 text-muted-foreground">
          Tres modalidades distintas: vídeo a tu ritmo, en vivo por enlace o presencial en sede
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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
