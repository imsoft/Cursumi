import { Users, BarChart3, BookOpenCheck, Award, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Users,
    title: "Gestión de equipos",
    description:
      "Organiza a tus empleados en equipos y asigna capacitaciones de forma masiva o individual.",
  },
  {
    icon: BarChart3,
    title: "Métricas en tiempo real",
    description:
      "Visualiza el progreso de cada empleado, tasas de completado por curso y rendimiento por equipo.",
  },
  {
    icon: BookOpenCheck,
    title: "Catálogo completo",
    description:
      "Accede a todos los cursos de Cursumi más contenido exclusivo para empresas.",
  },
  {
    icon: Award,
    title: "Certificados automáticos",
    description:
      "Tus empleados reciben certificados al completar cada curso, verificables en línea.",
  },
  {
    icon: Shield,
    title: "Materiales internos",
    description:
      "Sube PDFs y documentos de tu empresa para complementar la capacitación.",
  },
  {
    icon: Zap,
    title: "Onboarding rápido",
    description:
      "Invita empleados por email y ellos acceden al instante a los cursos asignados.",
  },
];

export function BusinessBenefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Beneficios
        </p>
        <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          Todo lo que necesitas para capacitar
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Cursumi Business centraliza la formación de tu empresa en una sola
          plataforma, con herramientas diseñadas para equipos de cualquier
          tamaño.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <Card key={b.title} className="border-border/50 bg-card/50">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
