"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircleQuestion, XCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateShortMX } from "@/lib/date-format";

type SessionOption = {
  id: string;
  city: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
};

type QuestionRow = {
  id: string;
  content: string;
  createdAt: string;
  status: string;
  answer: string | null;
  answeredAt: string | null;
};

interface InstructorAnonymousQuestionsClientProps {
  courseTitle: string;
  sessions: SessionOption[];
}

export function InstructorAnonymousQuestionsClient({
  courseTitle,
  sessions,
}: InstructorAnonymousQuestionsClientProps) {
  const [activeId, setActiveId] = useState(sessions[0]?.id ?? "");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!activeId) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    if (!opts?.silent) setLoading(true);
    setError(null);
    const res = await fetch(`/api/course-sessions/${activeId}/anonymous-questions`);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "No se pudieron cargar las preguntas");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  }, [activeId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeId) return;
    const id = window.setInterval(() => void load({ silent: true }), 12_000);
    return () => window.clearInterval(id);
  }, [activeId, load]);

  const setDraft = (qid: string, value: string) => {
    setDrafts((d) => ({ ...d, [qid]: value }));
  };

  const answerQuestion = async (questionId: string) => {
    const text = (drafts[questionId] ?? "").trim();
    if (!text) return;
    setBusyId(questionId);
    setError(null);
    try {
      const res = await fetch(`/api/course-sessions/${activeId}/anonymous-questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: text }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? "No se pudo guardar");
        return;
      }
      setDrafts((d) => ({ ...d, [questionId]: "" }));
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const dismissQuestion = async (questionId: string) => {
    if (!confirm("¿Descartar esta pregunta? Los alumnos dejarán de verla.")) return;
    setBusyId(questionId);
    setError(null);
    try {
      const res = await fetch(`/api/course-sessions/${activeId}/anonymous-questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? "No se pudo descartar");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Este curso no tiene sesiones presenciales configuradas. Añade sesiones en la edición del curso.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Preguntas anónimas</h1>
        <p className="text-sm text-muted-foreground">
          {courseTitle} — Los mensajes son anónimos para ti; no verás el nombre del alumno.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sessions.map((s) => (
          <Button
            key={s.id}
            type="button"
            variant={activeId === s.id ? "default" : "outline"}
            size="sm"
            className="h-auto flex-col items-start gap-0.5 py-2"
            onClick={() => setActiveId(s.id)}
          >
            <span className="font-medium">{s.city}</span>
            <span className="text-xs font-normal opacity-90">
              {formatDateShortMX(new Date(s.date))} · {s.startTime}–{s.endTime}
            </span>
          </Button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircleQuestion className="h-5 w-5" />
            Bandeja de la sesión seleccionada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {!loading && questions.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              No hay preguntas en esta sesión.
            </p>
          )}
          {!loading &&
            questions.map((q) => (
              <div key={q.id} className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">{q.content}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(q.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                  {q.status === "dismissed" && " · Descartada"}
                </p>

                {q.answer && (
                  <div className="mt-2 border-t border-border/60 pt-2">
                    <p className="text-xs font-medium text-primary">Tu respuesta</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{q.answer}</p>
                  </div>
                )}

                {q.status === "open" && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Escribe una respuesta pública para todos los inscritos…"
                      value={drafts[q.id] ?? ""}
                      onChange={(e) => setDraft(q.id, e.target.value)}
                      rows={3}
                      className="resize-y"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void answerQuestion(q.id)}
                        disabled={busyId === q.id || !(drafts[q.id] ?? "").trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Publicar respuesta
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => void dismissQuestion(q.id)}
                        disabled={busyId === q.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Descartar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
