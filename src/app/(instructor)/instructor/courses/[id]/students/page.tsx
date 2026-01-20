import Link from "next/link";
import { listStudentsForCourse, getCourseDetailForUser } from "@/app/actions/course-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, Search, Mail, Calendar } from "lucide-react";

export default async function CourseStudentsPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await getCourseDetailForUser(params.id).catch(() => null);
  const students = course ? await listStudentsForCourse(course.id).catch(() => []) : [];

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Curso no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El curso que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link href="/instructor/courses">Volver a mis cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${course.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Alumnos de {course.title}
        </h1>
        <p className="text-muted-foreground">
          {students.length} {students.length === 1 ? "alumno inscrito" : "alumnos inscritos"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de alumnos</CardTitle>
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
                className="pl-9"
                aria-label="Buscar alumno"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No hay alumnos inscritos en este curso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                        {(student.name || student.email)
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{student.name || "Sin nombre"}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Inscrito: {new Date(student.enrolledDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">Progreso</p>
                      <p className="text-sm text-muted-foreground">{student.progress}%</p>
                    </div>
                    <Badge variant={student.status === "active" ? "default" : "outline"}>
                      {student.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
