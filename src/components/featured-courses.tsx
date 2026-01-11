import { CourseCard, type CourseCardProps } from "@/components/course-card";

const featuredCourses: CourseCardProps[] = [
  {
    title: "Productividad con IA",
    mode: "Virtual",
    location: "Online",
    description: "Domina herramientas de IA para optimizar tu flujo de trabajo y crear contenidos impactantes.",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Persona trabajando con herramientas digitales",
  },
  {
    title: "Diseño UX para productos físicos",
    mode: "Presencial",
    location: "Ciudad de México",
    description: "Sesiones prácticas con mentores en CDMX enfocadas en prototipado físico y validación con usuarios reales.",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Diseñadores colaborando en maqueta física",
  },
  {
    title: "Bootcamp Full Stack",
    mode: "Híbrido",
    location: "Online + Bogotá",
    description: "Intensivo de 8 semanas con mentorías en vivo, proyectos reales y revisión de portafolio.",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Equipo de desarrollo trabajando en código",
  },
  {
    title: "Inteligencia emocional para equipos",
    mode: "Virtual",
    location: "Online",
    description: "Curso impartido en vivo con facilitadores certificados y talleres prácticos colaborativos.",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Personas en una sesión de equipo armoniosa",
  },
];

export const FeaturedCourses = () => {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
    >
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Cursos destacados
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Formación para perfiles ambiciosos
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featuredCourses.map((course) => (
          <CourseCard key={course.title} {...course} />
        ))}
      </div>
    </section>
  );
};

