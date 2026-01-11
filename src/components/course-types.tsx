import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

const modalityCards = [
  {
    title: "Cursos virtuales",
    description: "Sesiones en vivo y contenido grabado para aprender a tu ritmo, con soporte de instructores.",
    badge: "Online",
  },
  {
    title: "Cursos presenciales",
    description: "Experiencias en aula con instructores certificados en ciudades clave de LatAm.",
    badge: "Ciudad",
  },
  {
    title: "Talleres intensivos",
    description: "Bootcamps y talleres prácticos de corta duración para dominar lo esencial.",
    badge: "Immersive",
  },
];

export const CourseTypes = () => {
  return (
    <section
      id="cursos"
      className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
    >
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Modalidades
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Aprende desde donde estés con opciones que se adaptan a tu ritmo
        </h2>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {modalityCards.map((card) => (
          <Card key={card.title} className="group bg-background/70">
            <CardHeader className="gap-3 pb-2">
              <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {card.badge}
              </span>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>{card.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

