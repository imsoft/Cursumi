import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Cursumi me ayudó a lanzar mi primer taller híbrido: desde la publicación hasta la logística presencial fue fluido.",
    name: "María Torres",
    role: "Instructora de diseño",
  },
  {
    quote:
      "La plataforma me conecta con estudiantes serios y respetuosos, además los contenidos virtuales siempre están actualizados.",
    name: "David Paredes",
    role: "Estudiante en bootcamp",
  },
  {
    quote:
      "Gracias a Cursumi organicé un curso presencial en Medellín con la mitad de los asistentes ya registrados.",
    name: "Natalia Soto",
    role: "Coach y consultora",
  },
];

export const Testimonials = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Testimonios
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Historias reales de crecimiento
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription className="text-sm">{item.role}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground">
                “{item.quote}”
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

