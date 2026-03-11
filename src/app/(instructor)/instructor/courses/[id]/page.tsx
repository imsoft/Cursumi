import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, MessageSquare } from "lucide-react";
import { getCourseDetailForUser } from "@/app/actions/course-actions";

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourseDetailForUser(params.id).catch(() => null);

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Curso no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              No existe o fue eliminado.
            </p>
            <Button asChild>
              <Link href="/instructor/courses">Volver a mis cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusLabelMap: Record<string, { label: string; variant: "default" | "outline" }> = {
    published: { label: "Publicado", variant: "default" },
    draft: { label: "Borrador", variant: "outline" },
    archived: { label: "Archivado", variant: "outline" },
  };

  const statusLabel = statusLabelMap[course.status] || statusLabelMap.draft;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instructor/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-foreground">{course.title}</h1>
            <Badge variant={statusLabel.variant}>{statusLabel.label}</Badge>
          </div>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/instructor/courses/${course.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Categoría, modalidad y fechas
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <p className="text-foreground">{course.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nivel</p>
                  <p className="text-foreground">{course.level ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modalidad</p>
                  <Badge variant="outline">{course.modality}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duración</p>
                  <p className="text-foreground">{course.duration ?? "—"}</p>
                </div>
                {course.startDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
                    <p className="text-foreground">{course.startDate.toISOString()}</p>
                  </div>
                )}
                {course.nextSession && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Próxima sesión</p>
                    <p className="text-foreground">{course.nextSession.toISOString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estadísticas
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Resumen del curso
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{course._count.enrollments}</p>
                <p className="text-sm text-muted-foreground">Estudiantes inscritos</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/instructor/courses/${course.id}/students`}>
                  Ver todos los alumnos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Editar, alumnos y mensajes
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/instructor/courses/${course.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar curso
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/instructor/courses/${course.id}/students`}>
                  <Users className="mr-2 h-4 w-4" />
                  Ver alumnos
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/instructor/courses/${course.id}/messages`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mensajes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
