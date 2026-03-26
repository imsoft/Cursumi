import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, MessageSquare, MapPin, Calendar, Clock, DollarSign } from "lucide-react";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { CourseCoverImage } from "@/components/courses/course-cover-image";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { formatPriceMXN } from "@/lib/utils";
import { formatDateLongMX, formatDateShortMX } from "@/lib/date-format";
import { Separator } from "@/components/ui/separator";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseDetailForUser(id).catch(() => null);

  if (!course) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instructor/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{course.title}</h1>
          <Badge variant={statusLabel.variant}>{statusLabel.label}</Badge>
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

      <Card className="overflow-hidden border border-border">
        <CourseCoverImage imageUrl={course.imageUrl} title={course.title} />
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ModalityBadge modality={course.modality} size="md" />
            <Badge variant="outline">{course.category}</Badge>
            {course.level && <Badge variant="outline">{course.level}</Badge>}
          </div>
          <RichTextRenderer content={course.description} className="text-sm leading-relaxed text-muted-foreground" />
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Categoría, precio, modalidad y fechas
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
                  <ModalityBadge modality={course.modality} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duración</p>
                  <p className="text-foreground">{course.duration ?? "—"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Precio</p>
                    <p className="text-foreground">{formatPriceMXN(course.price)}</p>
                  </div>
                </div>
                {course.maxStudents != null && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cupo máximo</p>
                    <p className="text-foreground">{course.maxStudents} estudiantes</p>
                  </div>
                )}
                {(course.city || course.location) && (
                  <div className="sm:col-span-2 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                      <p className="text-foreground">
                        {[course.city, course.location].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                )}
                {course.startDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
                      <p className="text-foreground">{formatDateLongMX(course.startDate)}</p>
                    </div>
                  </div>
                )}
                {course.nextSession && (
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima sesión</p>
                      <p className="text-foreground">{formatDateLongMX(course.nextSession)}</p>
                    </div>
                  </div>
                )}
              </div>

              {course.courseSessions && course.courseSessions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sesiones presenciales</p>
                    <ul className="mt-3 space-y-3">
                      {course.courseSessions.map((s) => (
                        <li
                          key={s.id}
                          className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-foreground">{s.city}</span>
                          <span className="text-muted-foreground"> — {s.location}</span>
                          <div className="mt-1 text-muted-foreground">
                            {formatDateShortMX(s.date)} · {s.startTime} – {s.endTime} ·{" "}
                            {s._count.enrollments}/{s.maxStudents} inscritos
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
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
