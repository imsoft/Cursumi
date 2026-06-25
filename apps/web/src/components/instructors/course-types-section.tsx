import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const courseTypes = [
  {
    title: "Cursos en video",
    description:
      "Sube módulos grabados, textos y actividades; tus alumnos avanzan a su ritmo con certificado al terminar.",
    badge: "A tu ritmo",
  },
  {
    title: "Cursos por evento",
    description:
      "Crea sesiones con fecha y hora; cada una puede ser presencial en sede o por videollamada. Gestiona cupos y logística.",
    badge: "En vivo",
  },
];

export const InstructorsCourseTypes = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Tipos de cursos
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Diseña la modalidad que mejor se adapte a tu contenido
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {courseTypes.map((type) => (
          <Card key={type.title}>
            <CardHeader>
              <span className="inline-flex items-center rounded-full border border-primary/60 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-primary">
                {type.badge}
              </span>
              <CardTitle className="mt-3 text-lg">{type.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {type.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

