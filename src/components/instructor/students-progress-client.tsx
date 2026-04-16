"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Mail, Calendar, Search, ChevronDown, ChevronUp,
  CheckCircle2, Circle, BookOpen, FileQuestion, Trophy,
  Video, FileText, Gamepad2, Award,
} from "lucide-react";
import type { CourseProgressOverview, StudentProgressDetail } from "@/lib/course-service";
import { UnenrollButton } from "@/components/instructor/unenroll-button";

interface StudentsProgressClientProps {
  courseId: string;
  courseTitle: string;
  data: CourseProgressOverview;
}

const lessonTypeIcon: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  quiz: FileQuestion,
  assignment: BookOpen,
};

function StudentRow({
  student,
  courseId,
  sections,
  hasFinalExam,
}: {
  student: StudentProgressDetail;
  courseId: string;
  sections: CourseProgressOverview["sections"];
  hasFinalExam: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const initials = (student.name || student.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedLessons = student.completedLessonIds.length;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              {initials}
            </div>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{student.name || "Sin nombre"}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>Inscrito: {new Date(student.enrolledDate).toLocaleDateString("es-MX")}</span>
              {student.sessionLabel && (
                <span className="text-xs text-muted-foreground">· {student.sessionLabel}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-[140px]">
            <Progress value={student.progress} className="h-2 flex-1" />
            <span className="text-sm font-medium text-foreground w-10 text-right">{student.progress}%</span>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {completedLessons}/{totalLessons} lecciones
          </div>
          {student.examSubmission && (
            <Badge variant={student.examSubmission.passed ? "default" : "outline"}>
              Examen: {student.examSubmission.score}%
            </Badge>
          )}
          {student.certificateType && (
            <Award className="h-4 w-4 text-yellow-500" />
          )}
          <Badge variant={student.status === "active" ? "default" : "outline"}>
            {student.status === "active" ? "Activo" : student.status === "completed" ? "Completado" : "Inactivo"}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/10 p-4 space-y-4">
          {/* Secciones y lecciones */}
          {sections.map((section) => {
            const sectionQuiz = student.sectionQuizzes.find((sq) => sq.sectionId === section.id);
            return (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                  {section.hasQuiz && (
                    <div className="flex items-center gap-1.5">
                      <Gamepad2 className="h-3 w-3" />
                      {sectionQuiz ? (
                        <span className={`text-xs font-medium ${sectionQuiz.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          Quiz: {sectionQuiz.score}% {sectionQuiz.passed ? "✓" : "✗"}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Quiz: pendiente</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid gap-1.5">
                  {section.lessons.map((lesson) => {
                    const completed = student.completedLessonIds.includes(lesson.id);
                    const score = student.lessonScores[lesson.id];
                    const Icon = lessonTypeIcon[lesson.type] || BookOpen;
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                          completed ? "bg-green-50 dark:bg-green-900/10" : "bg-background"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className={completed ? "text-foreground" : "text-muted-foreground"}>
                          {lesson.title}
                        </span>
                        {score != null && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {score}%
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Examen final */}
          {hasFinalExam && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Examen final</span>
              </div>
              {student.examSubmission ? (
                <div className={`mt-2 rounded-md px-3 py-2 text-sm ${
                  student.examSubmission.passed
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  <span className="font-semibold">{student.examSubmission.passed ? "Aprobado" : "No aprobado"}</span>
                  {" — "}Calificación: <span className="font-semibold">{student.examSubmission.score}%</span>
                  <span className="text-xs ml-2">
                    ({new Date(student.examSubmission.submittedAt).toLocaleDateString("es-MX")})
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Aún no presenta el examen</p>
              )}
            </div>
          )}

          {/* Certificado */}
          {student.certificateType && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-foreground">
                  Constancia de {student.certificateType === "accreditation" ? "acreditación" : "participación"} emitida
                </span>
              </div>
            </div>
          )}

          {/* Unenroll */}
          <div className="border-t border-border pt-3 flex justify-end">
            <UnenrollButton
              courseId={courseId}
              enrollmentId={student.enrollmentId}
              studentName={student.name || student.email}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function StudentsProgressClient({ courseId, courseTitle, data }: StudentsProgressClientProps) {
  const [search, setSearch] = useState("");

  const filtered = data.students.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.name?.toLowerCase().includes(q)) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Alumnos de {courseTitle}
        </h1>
        <p className="text-muted-foreground">
          {data.students.length} {data.students.length === 1 ? "alumno inscrito" : "alumnos inscritos"}
          {" · "}Haz clic en un alumno para ver su progreso detallado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Progreso de alumnos</CardTitle>
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar alumno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {data.students.length === 0
                ? "Aún no hay alumnos inscritos en este curso."
                : "No se encontraron alumnos con ese criterio."}
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  courseId={courseId}
                  sections={data.sections}
                  hasFinalExam={data.hasFinalExam}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
