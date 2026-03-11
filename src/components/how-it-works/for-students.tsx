import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const studentSteps = [
  {
    title: "Crear tu cuenta",
    description:
      "Regístrate con correo o redes sociales y configura tu perfil.",
  },
  {
    title: "Explorar cursos",
    description:
      "Filtra por modalidad, categoría o ciudad y encuentra tu curso.",
  },
  {
    title: "Inscribirte y pagar",
    description:
      "Pago local y confirmación inmediata de tu inscripción.",
  },
  {
    title: "Aprender y certificarte",
    description:
      "Clases online o presenciales, comunidad y certificado al terminar.",
  },
];

export const HowItWorksStudents = () => {
  return (
    <section
      id="estudiantes"
      className="mx-auto max-w-6xl px-4 py-10"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Para estudiantes
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Aprende con un flujo guiado
        </h2>
        <p className="text-sm text-muted-foreground">
          Cada paso te acerca más rápido al curso ideal y a tu certificación.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {studentSteps.map((step) => (
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
        <Link href="/courses">
          <Button size="lg">Explorar cursos</Button>
        </Link>
      </div>
    </section>
  );
};

