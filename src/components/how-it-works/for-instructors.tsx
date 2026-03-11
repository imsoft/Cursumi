import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const instructorSteps = [
  {
    title: "Cuenta de instructor",
    description:
      "Perfil profesional, verificación y configuración de cobro.",
  },
  {
    title: "Diseñar tu curso",
    description:
      "Título, modalidad, fechas, duración, precio y logística.",
  },
  {
    title: "Publicar y compartir",
    description:
      "Sube recursos, publica y comparte en redes o eventos.",
  },
  {
    title: "Gestionar alumnos",
    description:
      "Asistencia, mensajes y certificados digitales o físicos.",
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

