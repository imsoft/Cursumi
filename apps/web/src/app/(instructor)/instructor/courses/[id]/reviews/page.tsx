import Link from "next/link";
import { getCourseDetailForUser, getInstructorCourseReviews } from "@/app/actions/course-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateLongMX } from "@/lib/date-format";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

export default async function InstructorCourseReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let course;
  let data: Awaited<ReturnType<typeof getInstructorCourseReviews>> | null = null;

  try {
    course = await getCourseDetailForUser(id);
    data = await getInstructorCourseReviews(id);
  } catch {
    course = null;
  }

  if (!course || !data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">Curso no encontrado</h2>
            <p className="mb-4 text-muted-foreground">No existe o no tienes permiso para verlo.</p>
            <Button asChild>
              <Link href="/instructor/courses">Volver a mis cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { reviews, averageApproved, countApproved, countPending } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${course.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Reseñas de alumnos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Promedio publicado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {countApproved > 0 ? averageApproved.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Solo reseñas ya visibles en la ficha del curso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{countApproved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{countPending}</p>
            <p className="text-xs text-muted-foreground">En espera de moderación</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las reseñas</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            Los comentarios pendientes aún no se muestran a estudiantes en la página pública del curso.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <EmptyState
              title="Sin reseñas"
              description="Aún no hay reseñas en este curso."
            />
          ) : (
            <ul className="divide-y divide-border">
              {reviews.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars value={r.rating} />
                      <span className="text-sm font-medium text-foreground">
                        {r.user.name?.trim() || "Alumno"}
                      </span>
                      {r.approved ? (
                        <Badge variant="default" className="normal-case tracking-normal">
                          Publicada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pendiente de moderación
                        </Badge>
                      )}
                    </div>
                    {r.comment?.trim() ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.comment.trim()}</p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">Sin comentario</p>
                    )}
                  </div>
                  <time
                    className="shrink-0 text-xs text-muted-foreground sm:text-right"
                    dateTime={r.createdAt.toISOString()}
                  >
                    {formatDateLongMX(r.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
