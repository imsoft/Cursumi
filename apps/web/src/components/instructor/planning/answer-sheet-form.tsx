"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AnswerSheetData,
  type AnswerQuestion,
  emptyAnswerQuestion,
  emptyAnswerTopic,
} from "@/lib/planning/answer-sheet";
import { optionLetter } from "@/lib/planning/quiz-assessment";

type Props = {
  value: AnswerSheetData;
  onChange: (next: AnswerSheetData) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group rounded-2xl border border-border bg-card/80">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold text-foreground hover:bg-muted/40">
        {title}
        <span className="text-muted-foreground transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="space-y-4 border-t border-border px-5 py-5">{children}</div>
    </details>
  );
}

export function AnswerSheetForm({ value, onChange }: Props) {
  const set = (patch: Partial<AnswerSheetData>) => onChange({ ...value, ...patch });

  const updateTopic = (id: string, patch: Partial<TopicPatch>) =>
    set({ topics: value.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const addTopic = () => set({ topics: [...value.topics, emptyAnswerTopic()] });
  const removeTopic = (id: string) => {
    const next = value.topics.filter((t) => t.id !== id);
    set({ topics: next.length > 0 ? next : [emptyAnswerTopic()] });
  };

  const updateQuestion = (tid: string, pid: string, patch: Partial<AnswerQuestion>) => {
    const topic = value.topics.find((t) => t.id === tid);
    if (!topic) return;
    updateTopic(tid, { questions: topic.questions.map((p) => (p.id === pid ? { ...p, ...patch } : p)) });
  };
  const addQuestion = (tid: string) => {
    const topic = value.topics.find((t) => t.id === tid);
    if (!topic) return;
    updateTopic(tid, { questions: [...topic.questions, emptyAnswerQuestion()] });
  };
  const removeQuestion = (tid: string, pid: string) => {
    const topic = value.topics.find((t) => t.id === tid);
    if (!topic) return;
    const next = topic.questions.filter((p) => p.id !== pid);
    updateTopic(tid, { questions: next.length > 0 ? next : [emptyAnswerQuestion()] });
  };

  const updateOption = (tid: string, pid: string, idx: number, texto: string) => {
    const topic = value.topics.find((t) => t.id === tid);
    const question = topic?.questions.find((p) => p.id === pid);
    if (!question) return;
    updateQuestion(tid, pid, { options: question.options.map((o, i) => (i === idx ? texto : o)) });
  };
  const addOption = (tid: string, pid: string) => {
    const topic = value.topics.find((t) => t.id === tid);
    const question = topic?.questions.find((p) => p.id === pid);
    if (!question) return;
    updateQuestion(tid, pid, { options: [...question.options, ""] });
  };
  const removeOption = (tid: string, pid: string, idx: number) => {
    const topic = value.topics.find((t) => t.id === tid);
    const question = topic?.questions.find((p) => p.id === pid);
    if (!question) return;
    const options = question.options.filter((_, i) => i !== idx);
    let correctIndex = question.correctIndex;
    if (correctIndex !== null) {
      if (correctIndex === idx) correctIndex = null;
      else if (correctIndex > idx) correctIndex -= 1;
    }
    updateQuestion(tid, pid, { options: options.length > 0 ? options : [""], correctIndex });
  };
  const markCorrect = (tid: string, pid: string, idx: number) => {
    const topic = value.topics.find((t) => t.id === tid);
    const question = topic?.questions.find((p) => p.id === pid);
    if (!question) return;
    updateQuestion(tid, pid, { correctIndex: question.correctIndex === idx ? null : idx });
  };

  return (
    <div className="space-y-4">
      <Section title="Portada y datos generales">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nombre del curso / sesión" value={value.courseName} onChange={(e) => set({ courseName: e.target.value })} />
          <Input label="Nombre del facilitador / instructor" value={value.instructorName} onChange={(e) => set({ instructorName: e.target.value })} />
          <Input label="Lugar de impartición" value={value.location} onChange={(e) => set({ location: e.target.value })} />
          <Input label="Fecha de impartición" value={value.date} placeholder="Ej. 8 de enero de 2025" onChange={(e) => set({ date: e.target.value })} />
          <Input label="Horario" value={value.schedule} placeholder="Ej. 4:00 pm" onChange={(e) => set({ schedule: e.target.value })} />
          <Input label="Duración" value={value.duration} placeholder="Ej. 221 minutos" onChange={(e) => set({ duration: e.target.value })} />
        </div>
        <Input label="Título del documento" value={value.documentTitle} onChange={(e) => set({ documentTitle: e.target.value })} />
      </Section>

      <p className="px-1 text-xs text-muted-foreground">
        Marca la opción correcta con el botón <Check className="inline h-3 w-3" /> de cada pregunta. Esa respuesta se resaltará en el PDF.
      </p>

      {value.topics.map((topic) => (
        <Section key={topic.id} title={topic.title || "Tema"}>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Título del tema" value={topic.title} placeholder="Ej. Tema 1: Introducción" onChange={(e) => updateTopic(topic.id, { title: e.target.value })} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => removeTopic(topic.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            label="Instrucciones del tema"
            value={topic.instructions}
            className="min-h-[60px]"
            onChange={(e) => updateTopic(topic.id, { instructions: e.target.value })}
          />

          <div className="space-y-4">
            {topic.questions.map((p, idx) => (
              <div key={p.id} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Pregunta {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeQuestion(topic.id, p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  label="Enunciado"
                  value={p.statement}
                  placeholder="Escribe la pregunta"
                  className="min-h-[60px]"
                  onChange={(e) => updateQuestion(topic.id, p.id, { statement: e.target.value })}
                />
                <div className="mt-3 space-y-2">
                  {p.options.map((o, i) => {
                    const isCorrect = p.correctIndex === i;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          title={isCorrect ? "Respuesta correcta" : "Marcar como correcta"}
                          onClick={() => markCorrect(topic.id, p.id, i)}
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                            isCorrect ? "border-green-500 bg-green-500 text-white" : "border-border text-muted-foreground hover:border-green-500",
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <span className="w-5 shrink-0 text-sm font-semibold text-primary">{optionLetter(i)}.</span>
                        <div className="flex-1">
                          <Input value={o} placeholder={`Opción ${optionLetter(i)}`} onChange={(e) => updateOption(topic.id, p.id, i, e.target.value)} />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeOption(topic.id, p.id, i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addOption(topic.id, p.id)}>
                    <Plus className="h-4 w-4" /> Agregar opción
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addQuestion(topic.id)}>
              <Plus className="h-4 w-4" /> Agregar pregunta
            </Button>
          </div>
        </Section>
      ))}

      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addTopic}>
        <Plus className="h-4 w-4" /> Agregar tema
      </Button>
    </div>
  );
}

type TopicPatch = {
  title: string;
  instructions: string;
  questions: AnswerQuestion[];
};
