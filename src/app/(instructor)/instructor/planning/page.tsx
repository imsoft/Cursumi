import Link from "next/link";
import { ClipboardList, FileText, ArrowRight, PlusCircle, CheckCircle2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { listInstructorCourses } from "@/app/actions/course-actions";
import { getCoursesPlanningProgress } from "@/app/actions/planning-actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

function CourseCard({
  course,
  progress,
}: {
  course: { id: string; modality: string; status: string; title: string };
  progress: { completed: number; total: number } | undefined;
}) {
  const prog = progress ?? { completed: 0, total: 0 };
  const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
  const isComplete = prog.total > 0 && prog.completed >= prog.total;

  return (
    <Link href={`/instructor/courses/${course.id}/planning`} className="block">
      <Card className="h-full border border-border transition hover:border-primary/50">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <ModalityBadge modality={course.modality} size="sm" />
            <span className="text-xs text-muted-foreground">{STATUS_LABEL[course.status] ?? course.status}</span>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">{course.title || "Curso sin título"}</h3>

          {prog.total > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{prog.completed} de {prog.total} documentos</span>
                {isComplete ? (
                  <span className="flex items-center gap-1 font-medium text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Expediente completo
                  </span>
                ) : (
                  <span className="font-medium text-primary">{pct}%</span>
                )}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {prog.total === 0 && (
            <p className="text-xs text-muted-foreground">Sin documentos iniciados</p>
          )}

          <div className="mt-auto flex items-center justify-end pt-1">
            <span className="flex items-center gap-1 text-sm font-medium text-primary">
              Abrir planeación <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function InstructorPlanningPage() {
  const courses = await listInstructorCourses().catch(() => []);
  const presenciales = courses.filter((c) => c.modality === "presencial");
  const virtuales = courses.filter((c) => c.modality === "virtual");

  const allRelevant = [...presenciales, ...virtuales];
  const progress = await getCoursesPlanningProgress(
    allRelevant.map((c) => ({ id: c.id, modality: c.modality as "presencial" | "virtual" })),
  ).catch(() => ({}) as Record<string, { completed: number; total: number }>);

  const hasAny = presenciales.length > 0 || virtuales.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Planeación didáctica</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elabora los documentos de certificación de tus cursos presenciales y los documentos de producción de tus cursos virtuales.
          </p>
        </div>
      </div>

      {!hasAny && (
        <Card className="border border-dashed border-border">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Aún no tienes cursos con planeación</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea un curso presencial o virtual para empezar a elaborar sus documentos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Cursos presenciales ── */}
      {presenciales.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Cursos presenciales</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/instructor/courses/new/presencial">
                <PlusCircle className="h-3.5 w-3.5" /> Nuevo curso
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {presenciales.map((course) => (
              <CourseCard key={course.id} course={course} progress={progress[course.id]} />
            ))}
          </div>
        </section>
      )}

      {/* ── Cursos virtuales ── */}
      {virtuales.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Cursos virtuales (video)</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/instructor/courses/new/virtual">
                <PlusCircle className="h-3.5 w-3.5" /> Nuevo curso
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {virtuales.map((course) => (
              <CourseCard key={course.id} course={course} progress={progress[course.id]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
