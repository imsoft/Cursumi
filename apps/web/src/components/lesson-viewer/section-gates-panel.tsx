"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SectionActivity } from "@/components/instructor/course-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, ChevronRight, ClipboardCheck, Gamepad2 } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { MemoryGame } from "./minigames/memory-game";
import { HangmanGame } from "./minigames/hangman-game";
import { SortGame } from "./minigames/sort-game";
import { MatchGame } from "./minigames/match-game";
import { fireGrandConfetti } from "@/lib/minigame-confetti";

type QuizUi = {
  show: boolean;
  answers: Record<number, number>;
  submitted: boolean;
  score: number;
  submitting: boolean;
};

const defaultQuizUi: QuizUi = {
  show: false,
  answers: {},
  submitted: false,
  score: 0,
  submitting: false,
};

export function SectionGatesPanel({
  activities,
  initialCompletion,
  courseId,
  currentSectionId,
  nextLesson,
  hasFinalExam,
  onCompletionChange,
}: {
  activities: SectionActivity[];
  initialCompletion: Record<string, boolean>;
  courseId: string;
  currentSectionId: string;
  nextLesson: { id: string; title: string } | null;
  hasFinalExam: boolean;
  onCompletionChange?: (activityId: string, passed: boolean) => void;
}) {
  const router = useRouter();
  const [completion, setCompletion] = useState<Record<string, boolean>>(initialCompletion);
  const [quizUi, setQuizUi] = useState<Record<string, QuizUi>>({});
  const [celebrateOpen, setCelebrateOpen] = useState(false);

  useEffect(() => {
    setCompletion(initialCompletion);
  }, [initialCompletion]);

  const handleNext = useCallback(() => {
    if (nextLesson) {
      router.push(`/dashboard/my-courses/${courseId}/lessons/${nextLesson.id}`);
    } else if (hasFinalExam) {
      router.push(`/dashboard/my-courses/${courseId}/exam`);
    } else {
      router.push(`/dashboard/my-courses/${courseId}`);
    }
  }, [courseId, hasFinalExam, nextLesson, router]);

  const submitSectionQuiz = useCallback(
    async (act: Extract<SectionActivity, { kind: "quiz" }>) => {
      const ui = { ...defaultQuizUi, ...quizUi[act.id] };
      const correct = act.questions.reduce(
        (acc, q, i) => acc + (ui.answers[i] === q.correct ? 1 : 0),
        0,
      );
      const score = act.questions.length
        ? Math.round((correct / act.questions.length) * 100)
        : 0;
      const passingScore = act.passingScore ?? 70;
      const passed = score >= passingScore;

      setQuizUi((prev) => ({
        ...prev,
        [act.id]: { ...ui, submitted: true, score, submitting: true },
      }));

      try {
        const res = await fetch(`/api/sections/${currentSectionId}/quiz/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, activityId: act.id, answers: ui.answers }),
        });
        if (res.ok && passed) {
          setCompletion((c) => {
            const next = { ...c, [act.id]: true };
            onCompletionChange?.(act.id, true);
            return next;
          });
          router.refresh();
        }
      } finally {
        setQuizUi((prev) => ({
          ...prev,
          [act.id]: {
            ...{ ...defaultQuizUi, ...prev[act.id] },
            submitted: true,
            score,
            submitting: false,
          },
        }));
      }
    },
    [courseId, currentSectionId, onCompletionChange, quizUi, router],
  );

  const completeMinigame = async (activityId: string) => {
    fireGrandConfetti();
    setCelebrateOpen(true);
    try {
      await fetch(`/api/sections/${currentSectionId}/minigame/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, activityId }),
      });
      setCompletion((c) => {
        const next = { ...c, [activityId]: true };
        onCompletionChange?.(activityId, true);
        return next;
      });
      router.refresh();
    } catch {
      setCompletion((c) => {
        const next = { ...c, [activityId]: true };
        onCompletionChange?.(activityId, true);
        return next;
      });
    }
  };

  const nextCta =
    nextLesson ? "Siguiente lección" : hasFinalExam ? "Ir al examen final" : "Volver al curso";

  if (activities.length === 0) return null;

  return (
    <>
      <Dialog open={celebrateOpen} onOpenChange={setCelebrateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¡Felicitaciones!</DialogTitle>
            <DialogDescription>
              Completaste una actividad de esta sección. Sigue con lo que viene a continuación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              className="min-w-[180px]"
              onClick={() => {
                setCelebrateOpen(false);
                handleNext();
              }}
            >
              {nextCta}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-10">
        {activities.map((act, idx) => {
          if (act.kind === "quiz") {
            const ui = { ...defaultQuizUi, ...quizUi[act.id] };
            const passingScore = act.passingScore ?? 70;
            const passedGate = completion[act.id];

            return (
              <div
                key={act.id}
                className="space-y-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-6"
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Test de sección {activities.length > 1 ? `(${idx + 1})` : ""}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Debes aprobar ({passingScore}% mínimo) para completar esta actividad.
                    </p>
                  </div>
                </div>

                {passedGate && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">Actividad aprobada.</p>
                  </div>
                )}

                {!passedGate && !ui.show && (
                  <Button
                    onClick={() =>
                      setQuizUi((p) => ({
                        ...p,
                        [act.id]: { ...defaultQuizUi, show: true },
                      }))
                    }
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Realizar test
                  </Button>
                )}

                {!passedGate && ui.show && (
                  <div className="space-y-6">
                    {act.questions.map((q, i) => (
                      <div key={i} className="space-y-3">
                        <p className="font-medium text-foreground">
                          {i + 1}. {stripHtml(q.question)}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, j) => {
                            const isSelected = ui.answers[i] === j;
                            const isCorrect = ui.submitted && j === q.correct;
                            const isWrong = ui.submitted && isSelected && j !== q.correct;
                            return (
                              <button
                                key={j}
                                type="button"
                                onClick={() =>
                                  !ui.submitted &&
                                  setQuizUi((prev) => {
                                    const cur = { ...defaultQuizUi, ...prev[act.id], show: true };
                                    return {
                                      ...prev,
                                      [act.id]: {
                                        ...cur,
                                        answers: { ...cur.answers, [i]: j },
                                      },
                                    };
                                  })
                                }
                                disabled={ui.submitted}
                                className={`w-full rounded-md border px-4 py-2 text-left text-sm transition-colors ${
                                  isCorrect
                                    ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : isWrong
                                    ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : isSelected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-background text-foreground hover:bg-muted"
                                }`}
                              >
                                {stripHtml(opt)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {!ui.submitted && (
                      <Button
                        onClick={() => submitSectionQuiz(act)}
                        disabled={
                          Object.keys(ui.answers).length < act.questions.length || ui.submitting
                        }
                      >
                        {ui.submitting ? "Enviando..." : "Enviar respuestas"}
                      </Button>
                    )}

                    {ui.submitted && (
                      <div
                        className={`rounded-lg p-4 text-sm font-medium ${
                          passedGate || ui.score >= passingScore
                            ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {passedGate || ui.score >= passingScore ? (
                          <div className="flex flex-col gap-3">
                            <span>Aprobado: {ui.score}%.</span>
                            {nextLesson ? (
                              <Button size="sm" onClick={handleNext} className="w-fit">
                                Siguiente lección
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            ) : hasFinalExam ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  router.push(`/dashboard/my-courses/${courseId}/exam`)
                                }
                                className="w-fit"
                              >
                                Presentar examen final
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p>No aprobado: {ui.score}%. Necesitas al menos {passingScore}%.</p>
                            <button
                              type="button"
                              onClick={() =>
                                setQuizUi((prev) => ({
                                  ...prev,
                                  [act.id]: {
                                    show: true,
                                    answers: {},
                                    submitted: false,
                                    score: 0,
                                    submitting: false,
                                  },
                                }))
                              }
                              className="underline underline-offset-2 hover:no-underline"
                            >
                              Intentar de nuevo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          const passedGate = completion[act.id];
          const mg = act.minigame;
          const minigameLabel =
            mg.type === "memory"
              ? "Memoria"
              : mg.type === "hangman"
              ? "Ahorcado"
              : mg.type === "match"
              ? "Conectar columnas"
              : "Ordenar";

          return (
            <div
              key={act.id}
              className="space-y-6 rounded-xl border-2 border-purple-400/40 bg-purple-50/50 p-6 dark:bg-purple-900/10"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-6 w-6 shrink-0 text-purple-600 dark:text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Minijuego: {minigameLabel}
                    {activities.length > 1 ? ` (${idx + 1})` : ""}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Completa el minijuego para avanzar en el curso.
                  </p>
                </div>
              </div>

              {passedGate ? (
                <div className="flex flex-col gap-3 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">¡Completado!</p>
                  </div>
                  {nextLesson ? (
                    <Button size="sm" onClick={handleNext} className="w-fit">
                      Siguiente lección
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : hasFinalExam ? (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/my-courses/${courseId}/exam`)}
                      className="w-fit"
                    >
                      Presentar examen final
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/my-courses/${courseId}`)}
                      className="w-fit"
                    >
                      Volver al curso
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {mg.type === "memory" && (
                    <MemoryGame
                      instruction={mg.instruction}
                      pairs={mg.pairs}
                      onComplete={() => completeMinigame(act.id)}
                    />
                  )}
                  {mg.type === "hangman" && (
                    <HangmanGame
                      instruction={mg.instruction}
                      words={mg.words}
                      onComplete={() => completeMinigame(act.id)}
                    />
                  )}
                  {mg.type === "sort" && (
                    <SortGame
                      instruction={mg.instruction}
                      items={mg.items}
                      onComplete={() => completeMinigame(act.id)}
                    />
                  )}
                  {mg.type === "match" && (
                    <MatchGame
                      instruction={mg.instruction}
                      pairs={mg.pairs}
                      onComplete={() => completeMinigame(act.id)}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
