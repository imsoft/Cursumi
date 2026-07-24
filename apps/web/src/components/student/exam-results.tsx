"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Trophy, AlertCircle, PlayCircle, BookOpen } from "lucide-react";
import type { CourseFinalExam, CourseLessonOption } from "@/components/instructor/course-types";

interface ExamResultsProps {
  exam: CourseFinalExam;
  courseId: string;
  lessons: CourseLessonOption[];
  evaluations: Record<string, boolean>;
  score: number;
  passed: boolean;
  attemptsUsed: number;
  onRetry?: () => void;
  onContinue?: () => void;
}

export const ExamResults = ({
  exam,
  courseId,
  lessons,
  evaluations,
  score,
  passed,
  attemptsUsed,
  onRetry,
  onContinue,
}: ExamResultsProps) => {
  const canRetry = exam.attemptsAllowed ? attemptsUsed < exam.attemptsAllowed : true;
  const totalQuestions = exam.questions.length;
  const correctAnswers = Object.values(evaluations).filter(Boolean).length;

  // Videos a repasar: lecciones ligadas a las preguntas que el alumno falló.
  // No revelamos CUÁLES preguntas falló — solo qué temas conviene reforzar.
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const reviewLessonIds = new Set<string>();
  for (const q of exam.questions) {
    if (evaluations[q.id] === false && q.relatedLessonId) {
      reviewLessonIds.add(q.relatedLessonId);
    }
  }
  const reviewLessons = [...reviewLessonIds]
    .map((id) => lessonById.get(id))
    .filter((l): l is CourseLessonOption => !!l);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Resultado principal */}
      <Card
        className={`border-2 ${
          passed
            ? "border-green-500 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
            : "border-red-500 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
        }`}
      >
        <CardContent className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            {passed ? (
              <Trophy className="h-20 w-20 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-20 w-20 text-red-600 dark:text-red-400" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">
            {passed ? "¡Felicidades! Has aprobado" : "No has aprobado"}
          </h2>

          <p className="text-lg text-muted-foreground mb-6">
            {passed
              ? "Has completado exitosamente el examen final"
              : `Necesitas ${exam.passingScore}% para aprobar`}
          </p>

          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div
                className={`text-5xl font-bold ${
                  passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {score.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Tu calificación</p>
            </div>

            <div className="border-l border-border" />

            <div>
              <div className="text-5xl font-bold text-foreground">
                {correctAnswers}/{totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Respuestas correctas</p>
            </div>
          </div>

          {!passed && canRetry && exam.attemptsAllowed && (
            <div className="rounded-lg border border-border bg-background p-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Te quedan {exam.attemptsAllowed - attemptsUsed} intentos
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {!passed && canRetry && onRetry && (
              <Button onClick={onRetry} size="lg">
                Reintentar examen
              </Button>
            )}
            {passed && onContinue && (
              <Button onClick={onContinue} size="lg">
                Continuar al curso
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repaso de videos: solo cuando NO aprobó. En vez de decirle qué preguntas
          falló, lo mandamos a reforzar los temas de esas preguntas. */}
      {!passed && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Repasa antes de tu próximo intento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewLessons.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Estos son los temas de las preguntas en las que puedes mejorar. Vuelve a verlos
                  con calma para llegar seguro a tu próximo intento.
                </p>
                <div className="space-y-2">
                  {reviewLessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/my-courses/${courseId}/lessons/${lesson.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <PlayCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{lesson.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{lesson.sectionTitle}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-primary">Ver video →</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Repasa el contenido del curso</p>
                  <p>
                    Vuelve a ver las lecciones del curso, tómate tu tiempo para leer cada pregunta
                    con cuidado y, si tienes dudas, consulta con tu instructor.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href={`/dashboard/my-courses/${courseId}`}>
                      Ir al curso
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen de estadísticas */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Respuestas correctas</p>
              <p className="text-2xl font-bold text-foreground">{correctAnswers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Respuestas incorrectas</p>
              <p className="text-2xl font-bold text-foreground">{totalQuestions - correctAnswers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Calificación obtenida</p>
              <p className="text-2xl font-bold text-foreground">{score.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
