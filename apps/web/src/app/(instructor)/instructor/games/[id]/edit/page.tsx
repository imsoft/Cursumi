"use client";

import { useEffect, useState, use } from "react";
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

interface ApiQuestion {
  question: string;
  options: string[];
  correct: number;
  timeLimitSec: number;
  points: number;
}

function inferType(q: ApiQuestion): QuestionType {
  if (
    q.options.length === 2 &&
    q.options[0] === "Verdadero" &&
    q.options[1] === "Falso"
  ) {
    return "truefalse";
  }
  return "multiple";
}

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("waiting");

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const game = data.game;
        setTitle(game.title);
        setGameStatus(game.status);
        setQuestions(
          game.questions.map((q: ApiQuestion) => ({
            question: q.question,
            type: inferType(q),
            options: q.options,
            correct: q.correct,
            timeLimitSec: q.timeLimitSec,
            points: q.points,
          }))
        );
      })
      .catch(() => setError("No se pudo cargar el juego"))
      .finally(() => setLoading(false));
  }, [id]);

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
      const res = await fetch(`/api/games/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }
      router.push("/instructor/games");
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (gameStatus !== "waiting") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Editar juego" description="Solo se pueden editar juegos que aún no han iniciado" />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Este juego ya fue iniciado o finalizado y no se puede editar.</p>
            <Button className="mt-4" onClick={() => router.push("/instructor/games")}>
              Volver a mis juegos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar juego"
        description="Modifica las preguntas de tu quiz"
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
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/instructor/games")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
