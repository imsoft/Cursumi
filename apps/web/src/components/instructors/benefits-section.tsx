import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Globe, Columns } from "lucide-react";

const benefits = [
  {
    title: "Cursos virtuales y presenciales en un mismo lugar",
    description:
      "Activa sesiones en vivo, contenido grabado o clases presenciales con controles claros de capacidad.",
    icon: Globe,
  },
  {
    title: "Gestión sencilla de alumnos y sesiones",
    description:
      "Calendarios, chats y reportes en un panel que se actualiza en tiempo real.",
    icon: Users,
  },
  {
    title: "Mayor alcance para tus cursos",
    description:
      "Promocionamos tu catálogo a miles de estudiantes filtrados por interés y ciudad.",
    icon: Columns,
  },
  {
    title: "Plataforma enfocada en aprendizaje real",
    description:
      "Certificados, evaluaciones y soporte para garantizar experiencias de impacto.",
    icon: ShieldCheck,
  },
];

export const InstructorsBenefits = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Beneficios
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Lo que ganas al publicar con nosotros
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <Card key={benefit.title}>
              <CardHeader>
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle className="mt-3 text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

