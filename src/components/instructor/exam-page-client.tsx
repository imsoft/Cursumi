"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Save, Plus, Trash2, CheckCircle2,
} from "lucide-react";
import type { CourseFinalExam, QuizQuestion } from "./course-types";
import { saveCourseExamContent } from "@/app/actions/course-actions";

interface ExamPageClientProps {
  courseId: string;
  exam: CourseFinalExam | null;
}

function newQuestion(): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
  };
}

export function ExamPageClient({ courseId, exam }: ExamPageClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [enabled, setEnabled] = useState(!!exam);
  const [title, setTitle] = useState(exam?.title || "Examen final");
  const [description, setDescription] = useState(exam?.description || "");
  const [instructions, setInstructions] = useState(exam?.instructions || "");
  const [passingScore, setPassingScore] = useState(exam?.passingScore ?? 80);
  const [timeLimit, setTimeLimit] = useState<number | "">(exam?.timeLimit ?? "");
  const [attemptsAllowed, setAttemptsAllowed] = useState<number | "">(exam?.attemptsAllowed ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>(exam?.questions || []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const data: CourseFinalExam | null = enabled
      ? {
          id: exam?.id || crypto.randomUUID(),
          title,
          description: description || undefined,
          instructions: instructions || undefined,
          passingScore,
          questions,
          timeLimit: timeLimit !== "" ? Number(timeLimit) : undefined,
          attemptsAllowed: attemptsAllowed !== "" ? Number(attemptsAllowed) : undefined,
        }
      : null;
    await saveCourseExamContent(courseId, data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveAndBack = async () => {
    await handleSave();
    router.push(`/instructor/courses/${courseId}/edit`);
  };

  const addQuestion = () => setQuestions((prev) => [...prev, newQuestion()]);

  const removeQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const updateOption = (qId: string, idx: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options?.map((o, i) => (i === idx ? value : o)) }
          : q
      )
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Examen final</h1>
          <p className="text-sm text-muted-foreground">
            Configura el examen que los estudiantes deben aprobar para obtener su certificado.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
          </Button>
          <Button onClick={handleSaveAndBack} disabled={saving}>
            Guardar y volver
          </Button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Examen guardado correctamente.
        </div>
      )}

      {/* Enable/disable */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Activar examen final</p>
              <p className="text-sm text-muted-foreground">
                Si está desactivado, los estudiantes obtendrán el certificado al completar las lecciones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {enabled && (
        <>
          {/* Basic config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Título del examen</label>
                <Input
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Examen final"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Textarea
                  className="mt-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional del examen..."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Instrucciones</label>
                <Textarea
                  className="mt-1"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instrucciones que verá el estudiante antes de comenzar..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Calificación mínima (%)
                  </label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Tiempo límite (minutos)
                  </label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    placeholder="Sin límite"
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Intentos permitidos
                  </label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    placeholder="Ilimitados"
                    value={attemptsAllowed}
                    onChange={(e) =>
                      setAttemptsAllowed(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Preguntas</h2>
                <p className="text-sm text-muted-foreground">
                  {questions.length} pregunta{questions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button onClick={addQuestion} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar pregunta
              </Button>
            </div>

            {questions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Agrega al menos una pregunta para el examen.
                </CardContent>
              </Card>
            )}

            {questions.map((q, qi) => (
              <Card key={q.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 shrink-0">
                      {qi + 1}
                    </Badge>
                    <Input
                      className="flex-1"
                      placeholder="Escribe la pregunta..."
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={q.type}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            type: e.target.value as QuizQuestion["type"],
                            options: e.target.value === "multiple-choice" ? ["", "", "", ""] : undefined,
                            correctAnswer: 0,
                          })
                        }
                      >
                        <option value="multiple-choice">Opción múltiple</option>
                        <option value="true-false">Verdadero / Falso</option>
                        <option value="short-answer">Respuesta corta</option>
                      </select>
                      <Input
                        type="number"
                        min={0}
                        className="w-20"
                        placeholder="pts"
                        value={q.points ?? 1}
                        onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {q.type === "multiple-choice" && (
                    <div className="ml-8 space-y-2">
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, { correctAnswer: oi })}
                            className={`shrink-0 h-5 w-5 rounded-full border-2 transition-colors ${
                              q.correctAnswer === oi
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/40"
                            }`}
                          />
                          <Input
                            placeholder={`Opción ${oi + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Haz clic en el círculo para marcar la respuesta correcta.
                      </p>
                    </div>
                  )}

                  {q.type === "true-false" && (
                    <div className="ml-8 flex gap-4">
                      {["Verdadero", "Falso"].map((label, oi) => (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => updateQuestion(q.id, { correctAnswer: oi })}
                          className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                            q.correctAnswer === oi
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {q.correctAnswer === oi && <CheckCircle2 className="h-4 w-4" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "short-answer" && (
                    <div className="ml-8">
                      <Input
                        placeholder="Respuesta correcta (opcional, para auto-calificación)"
                        value={typeof q.correctAnswer === "string" ? q.correctAnswer : ""}
                        onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {questions.length > 0 && (
              <Button variant="outline" className="w-full" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar pregunta
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
