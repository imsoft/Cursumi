"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import {
  GameQuestionEditor,
  emptyQuestion,
  type QuestionForm,
  type QuestionType,
} from "@/components/instructor/game-question-editor";

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
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  }

  function addQuestion(type: QuestionType = "multiple") {
    setQuestions((prev) => [...prev, emptyQuestion(type)]);
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
          <GameQuestionEditor
            key={qIndex}
            index={qIndex}
            question={q}
            canRemove={questions.length > 1}
            onChange={(updates) => updateQuestion(qIndex, updates)}
            onChangeOption={(optIndex, value) => updateOption(qIndex, optIndex, value)}
            onRemove={() => removeQuestion(qIndex)}
          />
        ))}

        <div className="flex gap-3 flex-wrap">
          <Button type="button" variant="outline" onClick={() => addQuestion("multiple")} className="gap-2">
            <Plus className="h-4 w-4" />
            Opción múltiple
          </Button>
          <Button type="button" variant="outline" onClick={() => addQuestion("truefalse")} className="gap-2">
            <Plus className="h-4 w-4" />
            Verdadero / Falso
          </Button>
        </div>

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
