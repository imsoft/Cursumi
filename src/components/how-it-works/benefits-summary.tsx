import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const studentBenefits = [
  "Acceso a cursos virtuales y presenciales",
  "Filtros por modalidad, categoría y ciudad",
  "Certificados digitales y físicos",
];

const instructorBenefits = [
  "Llega a más estudiantes calificados",
  "Panel de control para cursos y pagos",
  "Soporte para logística y certificaciones",
];

export const HowItWorksBenefits = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Beneficios
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Lo que gana cada lado de la plataforma
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {studentBenefits.map((benefit) => (
              <p key={benefit} className="text-sm text-muted-foreground">
                • {benefit}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {instructorBenefits.map((benefit) => (
              <p key={benefit} className="text-sm text-muted-foreground">
                • {benefit}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

