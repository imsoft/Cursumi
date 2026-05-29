import Link from "next/link";
import { ClipboardList, FileText, ArrowRight, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { listInstructorCourses } from "@/app/actions/course-actions";
import { PLANNING_DOCUMENTS } from "@/lib/planning/registry";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export default async function InstructorPlanningPage() {
  const courses = await listInstructorCourses().catch(() => []);
  const presenciales = courses.filter((c) => c.modality === "presencial");
  const totalDocs = PLANNING_DOCUMENTS.filter((d) => d.available).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Planeación didáctica</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elabora los documentos de certificación de tus cursos presenciales (carta descriptiva, evaluaciones,
            manuales y más). Elige un curso presencial para trabajar su planeación.
          </p>
        </div>
      </div>

      {presenciales.length === 0 ? (
        <Card className="border border-dashed border-border">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Aún no tienes cursos presenciales</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                La planeación didáctica aplica solo a cursos presenciales. Crea uno para empezar a elaborar sus documentos.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/instructor/courses/new/presencial">
                <PlusCircle className="h-4 w-4" /> Crear curso presencial
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {presenciales.map((course) => (
            <Link key={course.id} href={`/instructor/courses/${course.id}/planning`} className="block">
              <Card className="h-full border border-border transition hover:border-primary/50">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <ModalityBadge modality={course.modality} size="sm" />
                    <span className="text-xs text-muted-foreground">{STATUS_LABEL[course.status] ?? course.status}</span>
                  </div>
                  <h3 className="line-clamp-2 text-base font-semibold text-foreground">{course.title || "Curso sin título"}</h3>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">{totalDocs} documentos disponibles</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      Abrir planeación <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
