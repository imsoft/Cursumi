import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { listPlanningStatuses } from "@/app/actions/planning-actions";
import { getPlanningDocsByModality } from "@/lib/planning/registry";
import type { CourseModality } from "@/lib/planning/registry";

export default async function CoursePlanningIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseDetailForUser(id).catch(() => null);

  if (!course) {
    return <div className="p-8 text-center text-muted-foreground">Curso no encontrado.</div>;
  }

  const modality = course.modality as CourseModality;
  if (modality !== "presencial" && modality !== "virtual") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instructor/planning">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a planeación
          </Link>
        </Button>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          La planeación didáctica está disponible para cursos presenciales y virtuales.
        </div>
      </div>
    );
  }

  const docs = getPlanningDocsByModality(modality);
  const statuses = await listPlanningStatuses(id).catch(() => ({} as Record<string, string>));

  const available = docs.filter((d) => d.available);
  const completed = available.filter((d) => statuses[d.type] === "completed").length;
  const pct = available.length > 0 ? Math.round((completed / available.length) * 100) : 0;
  const isExpedientComplete = completed >= available.length;
  const nextPending = available.find((d) => statuses[d.type] !== "completed");

  const sectionLabel = modality === "presencial"
    ? "Documentos de certificación (CONOCER / STPS)"
    : "Documentos de producción del curso";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instructor/planning">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a planeación
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Planeación didáctica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.title} — {sectionLabel}. Cada documento se guarda y puede descargarse en PDF.
        </p>
      </div>

      {/* ── Barra de progreso del expediente ── */}
      <div className="rounded-2xl border border-border bg-card/80 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {isExpedientComplete ? (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Expediente completo
              </span>
            ) : (
              `Expediente: ${completed} de ${available.length} documentos completados`
            )}
          </span>
          <span className={`text-sm font-semibold ${isExpedientComplete ? "text-green-600" : "text-primary"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isExpedientComplete ? "bg-green-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {!isExpedientComplete && nextPending && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Siguiente: <span className="font-medium text-foreground">{nextPending.title}</span>
            </p>
            <Button size="sm" asChild className="gap-1.5 h-7 text-xs px-3">
              <Link href={`/instructor/courses/${id}/planning/${nextPending.type}`}>
                Continuar <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Lista guiada de documentos ── */}
      <div className="space-y-2">
        {docs.map((doc, index) => {
          const status = statuses[doc.type];
          const isCompleted = status === "completed";
          const isDraft = status === "draft";

          const row = (
            <div
              className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                doc.available
                  ? isCompleted
                    ? "border-green-200 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20"
                    : "border-border bg-card hover:border-primary/50"
                  : "border-dashed border-border bg-muted/30 opacity-60"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {!doc.available ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                ) : isCompleted ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : isDraft ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border text-muted-foreground">
                    <Circle className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-sm font-semibold text-foreground truncate">{doc.title}</h3>
                  {!doc.available && <span className="shrink-0 text-xs text-muted-foreground">Próximamente</span>}
                  {isCompleted && <span className="shrink-0 text-xs font-medium text-green-600">Completado</span>}
                  {isDraft && <span className="shrink-0 text-xs font-medium text-amber-600">Borrador</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
              </div>

              {doc.available && <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
          );

          return doc.available ? (
            <Link key={doc.type} href={`/instructor/courses/${id}/planning/${doc.type}`} className="block">
              {row}
            </Link>
          ) : (
            <div key={doc.type}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}
