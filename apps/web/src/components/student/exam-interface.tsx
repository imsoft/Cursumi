"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
  sortableKeyboardCoordinates, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, ArrowLeft, Send, GripVertical, CheckSquare, Square } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import type { CourseFinalExam, QuizQuestion } from "@/components/instructor/course-types";
import type { ExamAnswer } from "@/lib/exam-grading";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";

interface ExamInterfaceProps {
  exam: CourseFinalExam;
  onSubmit: (answers: Record<string, ExamAnswer>) => void;
  onCancel?: () => void;
  attemptsUsed?: number;
}

/** ¿Está respondida la pregunta según su tipo? (para el progreso y el mapa) */
function isAnswered(q: QuizQuestion, a: ExamAnswer | undefined): boolean {
  if (a === undefined) return false;
  switch (q.type) {
    case "multiple-choice":
    case "true-false":
      return typeof a === "number";
    case "checkbox":
      return Array.isArray(a) && a.length > 0;
    case "ordering":
      return Array.isArray(a) && a.length === (q.options?.length ?? 0);
    case "matching":
      return (
        Array.isArray(a) &&
        a.length === (q.options?.length ?? 0) &&
        (a as string[]).every((x) => typeof x === "string" && x.length > 0)
      );
    default:
      return true;
  }
}

/** Fila arrastrable para preguntas de "ordenar". */
function SortableRow({ id, index, label }: { id: string; index: number; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className={`flex items-center gap-3 rounded-lg border-2 bg-card p-3 ${isDragging ? "border-primary shadow-lg" : "border-border"}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        title="Arrastra para ordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {index + 1}
      </span>
      <span className="text-base text-foreground">{stripHtml(label)}</span>
    </div>
  );
}

export const ExamInterface = ({ exam, onSubmit, onCancel, attemptsUsed = 0 }: ExamInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>(() => {
    // Las preguntas de "ordenar" arrancan con el orden mostrado (ya barajado por
    // el servidor); así el alumno solo tiene que reacomodar lo que crea necesario.
    const init: Record<string, ExamAnswer> = {};
    for (const q of exam.questions) {
      if (q.type === "ordering" && q.options) init[q.id] = [...q.options];
    }
    return init;
  });
  const [timeRemaining, setTimeRemaining] = useState<number | null>(exam.timeLimit ? exam.timeLimit * 60 : null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;
  const answeredQuestions = exam.questions.filter((q) => isAnswered(q, answers[q.id])).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const setAnswer = (qid: string, val: ExamAnswer) => setAnswers((prev) => ({ ...prev, [qid]: val }));

  const handleSubmitExam = useCallback(() => {
    setIsSubmitting(true);
    onSubmit(answers);
  }, [answers, onSubmit]);

  const handleAutoSubmit = useCallback(() => {
    if (isSubmitting) return;
    handleSubmitExam();
  }, [isSubmitting, handleSubmitExam]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, handleAutoSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const allQuestionsAnswered = answeredQuestions === totalQuestions;

  // ── Render de la respuesta según el tipo ────────────────────────────────────
  const renderAnswerArea = (q: QuizQuestion) => {
    // multiple-choice / true-false: una sola opción
    if (q.type === "multiple-choice" || q.type === "true-false") {
      const rawOptions = q.type === "true-false" ? ["Verdadero", "Falso"] : q.options ?? [];
      const options = rawOptions.map((opt, i) => ({ label: opt, index: i })).filter((o) => o.label.trim() !== "");
      const selected = answers[q.id];
      return (
        <div className="space-y-3">
          {options.map(({ label, index }) => {
            const isSelected = selected === index;
            return (
              <button
                key={index}
                onClick={() => setAnswer(q.id, index)}
                className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="shrink-0">
                  {isSelected ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                </div>
                <span className={`text-base ${isSelected ? "font-semibold text-primary" : "text-foreground"}`}>{stripHtml(label)}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // checkbox: varias correctas
    if (q.type === "checkbox") {
      const options = (q.options ?? []).map((opt, i) => ({ label: opt, index: i })).filter((o) => o.label.trim() !== "");
      const selected = new Set((answers[q.id] as number[] | undefined) ?? []);
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Selecciona todas las respuestas correctas.</p>
          {options.map(({ label, index }) => {
            const isSelected = selected.has(index);
            return (
              <button
                key={index}
                onClick={() => {
                  const next = new Set(selected);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  setAnswer(q.id, [...next].sort((a, b) => a - b));
                }}
                className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="shrink-0">
                  {isSelected ? <CheckSquare className="h-6 w-6 text-primary" /> : <Square className="h-6 w-6 text-muted-foreground" />}
                </div>
                <span className={`text-base ${isSelected ? "font-semibold text-primary" : "text-foreground"}`}>{stripHtml(label)}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // ordering: arrastrar para ordenar
    if (q.type === "ordering") {
      const order = (answers[q.id] as string[] | undefined) ?? q.options ?? [];
      const onDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIndex = order.indexOf(String(active.id));
        const newIndex = order.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;
        setAnswer(q.id, arrayMove(order, oldIndex, newIndex));
      };
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Arrastra los elementos para colocarlos en el orden correcto.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {order.map((item, i) => (
                  <SortableRow key={item} id={item} index={i} label={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      );
    }

    // matching: relacionar columnas (izquierda fija, derecha en menús)
    if (q.type === "matching") {
      const left = q.options ?? [];
      const right = q.matchRight ?? [];
      const current = (answers[q.id] as string[] | undefined) ?? left.map(() => "");
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Elige la opción que corresponde a cada elemento.</p>
          <div className="space-y-2">
            {left.map((leftItem, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                <span className="flex-1 text-base font-medium text-foreground">{stripHtml(leftItem)}</span>
                <span className="hidden text-muted-foreground sm:inline">→</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-64"
                  value={current[i] ?? ""}
                  onChange={(e) => {
                    const next = [...current];
                    next[i] = e.target.value;
                    setAnswer(q.id, next);
                  }}
                >
                  <option value="">Selecciona…</option>
                  {right.map((r, ri) => (
                    <option key={ri} value={r}>{stripHtml(r)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Header con título y tiempo */}
      <Card className="border-2 border-primary/30 bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              {exam.description && (
                <RichTextRenderer content={exam.description} className="mt-1 text-sm text-muted-foreground" />
              )}
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? "text-red-500" : "text-primary"}`} />
                <span className={`text-xl font-bold ${timeRemaining < 300 ? "text-red-500" : "text-foreground"}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Información del intento */}
      {exam.attemptsAllowed && (
        <Card className={`border ${attemptsUsed >= exam.attemptsAllowed - 1 ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20" : "border-border bg-card/90"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${attemptsUsed >= exam.attemptsAllowed - 1 ? "text-red-600" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">
                Intento {attemptsUsed + 1} de {exam.attemptsAllowed}
                {attemptsUsed >= exam.attemptsAllowed - 1 && " - Este es tu último intento"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progreso */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progreso del examen</span>
              <span className="text-muted-foreground">{answeredQuestions} de {totalQuestions} respondidas</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Pregunta actual */}
      <Card className="border-2 border-primary/20 bg-card">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Pregunta {currentQuestionIndex + 1} de {totalQuestions}</Badge>
            <Badge variant="outline">{currentQuestion.points} puntos</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">{stripHtml(currentQuestion.question)}</h3>
          {renderAnswerArea(currentQuestion)}
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestion}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          )}
          {isLastQuestion ? (
            <Button onClick={() => setShowConfirmSubmit(true)} disabled={!allQuestionsAnswered || isSubmitting} className="flex-1 sm:flex-initial">
              <Send className="mr-2 h-4 w-4" />
              {allQuestionsAnswered ? "Enviar examen" : `Faltan ${totalQuestions - answeredQuestions} preguntas`}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1 sm:flex-initial">
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md border-2 border-border">
            <CardHeader>
              <CardTitle>¿Enviar examen?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Estás a punto de enviar tu examen. Una vez enviado, no podrás modificar tus respuestas.
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Preguntas respondidas:</span>
                  <span className="font-semibold">{answeredQuestions} de {totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calificación mínima:</span>
                  <span className="font-semibold">{exam.passingScore}%</span>
                </div>
                {exam.attemptsAllowed && (
                  <div className="flex justify-between">
                    <span>Intentos restantes:</span>
                    <span className="font-semibold">{exam.attemptsAllowed - attemptsUsed - 1}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowConfirmSubmit(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleSubmitExam} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Enviando..." : "Confirmar envío"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mini mapa de preguntas */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle className="text-sm">Mapa de preguntas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2 sm:grid-cols-12">
            {exam.questions.map((question, index) => {
              const answered = isAnswered(question, answers[question.id]);
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all ${
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : answered
                      ? "border-green-500 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      {exam.instructions && (
        <Card className="border border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextRenderer content={exam.instructions} className="text-sm text-muted-foreground" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
