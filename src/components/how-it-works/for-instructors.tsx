import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const instructorSteps = [
  {
    title: "Crear tu cuenta de instructor",
    description:
      "Completa tu perfil profesional, verifica tu identidad y configura tus credenciales.",
  },
  {
    title: "Diseñar y configurar tu curso",
    description:
      "Define título, modalidad, fechas, duración, precios y logística presencial.",
  },
  {
    title: "Publicar y compartir",
    description:
      "Sube recursos, activa la visibilidad y comparte tu curso en redes y eventos.",
  },
  {
    title: "Gestionar alumnos y sesiones",
    description:
      "Monitorea asistencia, responde dudas y entrega certificados digitales o físicos.",
  },
];

export const HowItWorksInstructors = () => {
  return (
    <section
      id="instructores"
      className="mx-auto max-w-6xl px-4 py-10"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Para instructores
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Publica cursos y crece tu comunidad
        </h2>
        <p className="text-sm text-muted-foreground">
          Sigue el flujo diseñado para poner tus cursos frente a estudiantes reales.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {instructorSteps.map((step) => (
          <Card key={step.title}>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Link href="/instructors">
          <Button variant="outline" size="lg">
            Publicar mi curso
          </Button>
        </Link>
      </div>
    </section>
  );
};

