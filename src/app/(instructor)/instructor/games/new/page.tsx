"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";

interface QuestionForm {
  question: string;
  options: [string, string, string, string];
  correct: number;
  timeLimitSec: number;
  points: number;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

function emptyQuestion(): QuestionForm {
  return {
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    timeLimitSec: 20,
    points: 1000,
  };
}

export default function NewGamePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(index: number, updates: Partial<QuestionForm>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options] as [string, string, string, string];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`La pregunta ${i + 1} no tiene texto`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError(`La pregunta ${i + 1} tiene opciones vacías`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear el juego");
        return;
      }
      router.push(`/instructor/games/${data.game.id}/host`);
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Crear juego"
        description="Define las preguntas de tu quiz en tiempo real"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del juego</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Título del juego"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {questions.map((q, qIndex) => (
          <Card key={qIndex}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Pregunta {qIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qIndex)}
                disabled={questions.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                placeholder="Texto de la pregunta"
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <span className="font-semibold text-sm w-5 shrink-0">
                      {OPTION_LABELS[optIndex]}
                    </span>
                    <Input
                      placeholder={`Opción ${OPTION_LABELS[optIndex]}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Respuesta correcta:</span>
                  <select
                    value={q.correct}
                    onChange={(e) => updateQuestion(qIndex, { correct: Number(e.target.value) })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {OPTION_LABELS.map((label, i) => (
                      <option key={i} value={i}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tiempo:</span>
                  <select
                    value={q.timeLimitSec}
                    onChange={(e) => updateQuestion(qIndex, { timeLimitSec: Number(e.target.value) })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {[10, 15, 20, 30].map((t) => (
                      <option key={t} value={t}>{t}s</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Puntos:</span>
                  <select
                    value={q.points}
                    onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {[500, 1000].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={addQuestion} className="self-start">
          <Plus className="h-4 w-4 mr-2" />
          Agregar pregunta
        </Button>

        <Separator />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creando..." : "Crear juego"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
