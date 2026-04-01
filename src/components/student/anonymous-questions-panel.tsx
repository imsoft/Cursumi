"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircleQuestion, Send, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type QuestionRow = {
  id: string;
  content: string;
  createdAt: string;
  status: string;
  answer: string | null;
  answeredAt: string | null;
  isMine?: boolean;
};

interface AnonymousQuestionsPanelProps {
  sessionId: string;
}

export function AnonymousQuestionsPanel({ sessionId }: AnonymousQuestionsPanelProps) {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    const res = await fetch(`/api/course-sessions/${sessionId}/anonymous-questions`);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "No se pudieron cargar las preguntas");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => void load({ silent: true }), 12_000);
    return () => window.clearInterval(id);
  }, [load]);

  const handleSubmit = async () => {
    const text = draft.trim();
    if (text.length < 3) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/course-sessions/${sessionId}/anonymous-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? "No se pudo enviar");
        return;
      }
      setDraft("");
      if (j.question) {
        setQuestions((prev) => [j.question, ...prev]);
      } else {
        await load();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircleQuestion className="h-5 w-5 text-primary" />
          Preguntas anónimas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tu nombre no se muestra al profesor ni a otros alumnos. Sirve para dudas durante la clase
          presencial sin exponerte.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Escribe tu pregunta…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={2000}
            className="resize-y min-h-[88px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{draft.length}/2000</span>
            <Button type="button" size="sm" onClick={() => void handleSubmit()} disabled={sending || draft.trim().length < 3}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Enviando…" : "Enviar pregunta"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preguntas de la sesión
          </p>
          {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {!loading && questions.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Aún no hay preguntas. Sé el primero en escribir.
            </p>
          )}
          {questions.map((q) => (
            <div
              key={q.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                q.isMine ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-foreground">{q.content}</p>
                {q.isMine && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <UserRound className="h-3 w-3" />
                    Tuya
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {new Date(q.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
              </p>
              {q.answer && (
                <div className="mt-2 border-t border-border/60 pt-2">
                  <p className="text-xs font-medium text-primary">Respuesta del instructor</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{q.answer}</p>
                </div>
              )}
              {!q.answer && q.status === "open" && (
                <p className="mt-2 text-xs text-muted-foreground">Pendiente de respuesta</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
