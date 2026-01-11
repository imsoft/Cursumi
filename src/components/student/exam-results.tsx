"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, AlertCircle, Circle } from "lucide-react";
import type { CourseFinalExam } from "@/components/instructor/course-types";

interface ExamResultsProps {
  exam: CourseFinalExam;
  userAnswers: Record<string, number>;
  score: number;
  passed: boolean;
  attemptsUsed: number;
  onRetry?: () => void;
  onContinue?: () => void;
}

export const ExamResults = ({
  exam,
  userAnswers,
  score,
  passed,
  attemptsUsed,
  onRetry,
  onContinue,
}: ExamResultsProps) => {
  const canRetry = exam.attemptsAllowed ? attemptsUsed < exam.attemptsAllowed : true;
  const totalQuestions = exam.questions.length;
  const correctAnswers = exam.questions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  ).length;

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

          {!passed && canRetry && (
            <div className="rounded-lg border border-border bg-background p-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Te quedan {exam.attemptsAllowed! - attemptsUsed} intentos
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

      {/* Desglose de respuestas */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Revisión de respuestas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exam.questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card
                key={question.id}
                className={`border-2 ${
                  isCorrect
                    ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                    : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Pregunta {index + 1}</Badge>
                        <Badge variant="outline">{question.points} puntos</Badge>
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {question.question}
                      </p>
                    </div>
                  </div>

                  {question.type === "multiple-choice" && question.options && (
                    <div className="space-y-2 ml-9">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === optIndex;
                        const isCorrectAnswer = question.correctAnswer === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                              isCorrectAnswer
                                ? "border-green-500 bg-green-100 dark:bg-green-950/30"
                                : isUserAnswer
                                ? "border-red-500 bg-red-100 dark:bg-red-950/30"
                                : "border-border bg-background"
                            }`}
                          >
                            <div className="shrink-0">
                              {isCorrectAnswer ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : isUserAnswer ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isCorrectAnswer || isUserAnswer
                                  ? "font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {option}
                            </span>
                            {isCorrectAnswer && (
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-primary/10 text-primary ml-auto">
                                Correcta
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border bg-background ml-auto border-red-500 text-red-600">
                                Tu respuesta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Respuestas correctas</p>
              <p className="text-2xl font-bold text-foreground">
                {correctAnswers}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Respuestas incorrectas</p>
              <p className="text-2xl font-bold text-foreground">
                {totalQuestions - correctAnswers}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Calificación obtenida</p>
              <p className="text-2xl font-bold text-foreground">{score.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de ayuda si no pasó */}
      {!passed && (
        <Card className="border-l-4 border-l-blue-600 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Consejos para tu próximo intento:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>Revisa el material del curso nuevamente</li>
                  <li>Presta atención a las respuestas correctas mostradas arriba</li>
                  <li>Tómate tu tiempo para leer cada pregunta cuidadosamente</li>
                  <li>Si tienes dudas, consulta con el instructor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
