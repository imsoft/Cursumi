import { CheckCircle2, BookOpen, TrendingUp } from "lucide-react";

const studentBenefits = [
  "Acceso a cursos virtuales y presenciales",
  "Filtros por modalidad, categoría y ciudad",
  "Certificados digitales y físicos",
  "Soporte continuo de instructores expertos",
];

const instructorBenefits = [
  "Llega a más estudiantes calificados",
  "Panel de control para cursos y pagos",
  "Soporte para logística y certificaciones",
  "Métricas en tiempo real de tu audiencia",
];

export const HowItWorksBenefits = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
          Beneficios
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          Lo que gana cada lado
        </h2>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Cursumi está diseñado para que tanto estudiantes como instructores
          salgan ganando.
        </p>
      </div>

      {/* Comparison cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Students */}
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Para estudiantes
            </h3>
          </div>
          <ul className="space-y-3.5">
            {studentBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                  aria-hidden
                />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructors */}
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Para instructores
            </h3>
          </div>
          <ul className="space-y-3.5">
            {instructorBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                  aria-hidden
                />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
