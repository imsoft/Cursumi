import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const testimonials = [
  {
    name: "Gabriela Morales",
    area: "Marketing digital",
    quote:
      "Compartir mis workshops híbridos en Cursumi fue veloz. La plataforma me ayudó a llenar cupos en menos de 2 semanas.",
  },
  {
    name: "Luis Herrera",
    area: "Programación web",
    quote:
      "Me encanta cómo puedo gestionar estudiantes online y presenciales desde un solo panel y entregar certificados.",
  },
  {
    name: "Verónica Díaz",
    area: "Data Science",
    quote:
      "La visibilidad que me dio Cursumi permitió que mi bootcamp agotara boletos y recibí feedback útil al instante.",
  },
];

export const InstructorsTestimonials = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Testimonios
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Lo que dicen otros instructores
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name}>
            <CardHeader>
              <CardTitle className="text-lg">{testimonial.name}</CardTitle>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {testimonial.area}
              </p>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {testimonial.quote}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

