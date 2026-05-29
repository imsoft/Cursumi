import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { listPlanningStatuses } from "@/app/actions/planning-actions";
import { PLANNING_DOCUMENTS } from "@/lib/planning/registry";

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

  if (course.modality !== "presencial") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al curso
          </Link>
        </Button>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          La planeación didáctica solo está disponible para cursos presenciales.
        </div>
      </div>
    );
  }

  const statuses = await listPlanningStatuses(id).catch(() => ({} as Record<string, string>));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Planeación didáctica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.title} — completa los documentos de certificación. Cada uno se guarda y puede descargarse en PDF.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANNING_DOCUMENTS.map((doc) => {
          const status = statuses[doc.type];
          const card = (
            <Card className={`h-full border ${doc.available ? "border-border hover:border-primary/50" : "border-dashed border-border opacity-70"} transition`}>
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-primary" />
                  {!doc.available ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" /> Próximamente
                    </span>
                  ) : status === "completed" ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="h-3 w-3" /> Completado
                    </span>
                  ) : status ? (
                    <span className="text-xs font-medium text-amber-600">Borrador</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin iniciar</span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-foreground">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </CardContent>
            </Card>
          );

          return doc.available ? (
            <Link key={doc.type} href={`/instructor/courses/${id}/planning/${doc.type}`} className="block">
              {card}
            </Link>
          ) : (
            <div key={doc.type}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
