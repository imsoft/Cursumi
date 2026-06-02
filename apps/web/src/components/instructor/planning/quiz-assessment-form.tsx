"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { type QuizAssessmentData, emptyQuestion, optionLetter } from "@/lib/planning/quiz-assessment";

type Props = {
  value: QuizAssessmentData;
  onChange: (next: QuizAssessmentData) => void;
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

export function QuizAssessmentForm({ value, onChange }: Props) {
  const set = (patch: Partial<QuizAssessmentData>) => onChange({ ...value, ...patch });

  const updateQuestion = (id: string, patch: Partial<{ statement: string; options: string[] }>) =>
    set({ questions: value.questions.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

  const addQuestion = () => set({ questions: [...value.questions, emptyQuestion()] });

  const removeQuestion = (id: string) => {
    const rows = value.questions.filter((p) => p.id !== id);
    set({ questions: rows.length > 0 ? rows : [emptyQuestion()] });
  };

  const updateOption = (pid: string, idx: number, texto: string) => {
    const question = value.questions.find((p) => p.id === pid);
    if (!question) return;
    const options = question.options.map((o, i) => (i === idx ? texto : o));
    updateQuestion(pid, { options });
  };

  const addOption = (pid: string) => {
    const question = value.questions.find((p) => p.id === pid);
    if (!question) return;
    updateQuestion(pid, { options: [...question.options, ""] });
  };

  const removeOption = (pid: string, idx: number) => {
    const question = value.questions.find((p) => p.id === pid);
    if (!question) return;
    const options = question.options.filter((_, i) => i !== idx);
    updateQuestion(pid, { options: options.length > 0 ? options : [""] });
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
      </Section>

      <Section title="Cuestionario">
        <Input label="Título del cuestionario" value={value.questionnaireTitle} onChange={(e) => set({ questionnaireTitle: e.target.value })} />
        <Textarea
          label="Instrucciones (opcional)"
          value={value.instructions}
          placeholder="Ej. El participante debe elegir la respuesta correcta. Cada pregunta vale 5 puntos."
          className="min-h-[60px]"
          onChange={(e) => set({ instructions: e.target.value })}
        />

        <div className="space-y-4">
          {value.questions.map((p, idx) => (
            <div key={p.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Pregunta {idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeQuestion(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                label="Enunciado"
                value={p.statement}
                placeholder="Escribe la pregunta"
                className="min-h-[60px]"
                onChange={(e) => updateQuestion(p.id, { statement: e.target.value })}
              />
              <div className="mt-3 space-y-2">
                {p.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm font-semibold text-primary">{optionLetter(i)}.</span>
                    <div className="flex-1">
                      <Input value={o} placeholder={`Opción ${optionLetter(i)}`} onChange={(e) => updateOption(p.id, i, e.target.value)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeOption(p.id, i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addOption(p.id)}>
                  <Plus className="h-4 w-4" /> Agregar opción
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Agregar pregunta
          </Button>
        </div>
      </Section>
    </div>
  );
}
