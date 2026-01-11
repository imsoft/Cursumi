import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Crear tu cuenta de instructor",
    description:
      "Regístrate, añade tu bio, experiencia y verifica tu identidad.",
  },
  {
    title: "Configurar tu perfil",
    description:
      "Completa tu imagen, datos de contacto y detalles de pago para recibir ingresos.",
  },
  {
    title: "Crear tu primer curso",
    description:
      "Define temario, duración, precio, modalidad y fechas; añade recursos descargables.",
  },
  {
    title: "Publicar y compartir",
    description:
      "Activa la visibilidad, comparte el enlace y monitorea alumnos desde el panel.",
  },
];

export const InstructorsSteps = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Flujos claros
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Comienza en minutos con este flujo
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">
                Paso {index + 1}
              </span>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {step.description}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button size="lg" className="rounded-full" id="convertir">
          Empezar ahora
        </Button>
      </div>
    </section>
  );
};

