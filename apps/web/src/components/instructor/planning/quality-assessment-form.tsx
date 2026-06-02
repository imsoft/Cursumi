"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type QualityAssessmentData,
  emptyQualityQuestion,
  emptyQualitySection,
} from "@/lib/planning/quality-assessment";
import { optionLetter } from "@/lib/planning/quiz-assessment";

type Props = {
  value: QualityAssessmentData;
  onChange: (next: QualityAssessmentData) => void;
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

export function QualityAssessmentForm({ value, onChange }: Props) {
  const set = (patch: Partial<QualityAssessmentData>) => onChange({ ...value, ...patch });

  // Escala (opciones compartidas)
  const updateScale = (idx: number, texto: string) =>
    set({ scale: value.scale.map((o, i) => (i === idx ? texto : o)) });
  const addScale = () => set({ scale: [...value.scale, ""] });
  const removeScale = (idx: number) => {
    const next = value.scale.filter((_, i) => i !== idx);
    set({ scale: next.length > 0 ? next : [""] });
  };

  // Secciones
  const updateSection = (id: string, patch: Partial<{ title: string; questions: QualityAssessmentData["sections"][number]["questions"] }>) =>
    set({ sections: value.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addSection = () => set({ sections: [...value.sections, emptyQualitySection()] });
  const removeSection = (id: string) => {
    const next = value.sections.filter((s) => s.id !== id);
    set({ sections: next.length > 0 ? next : [emptyQualitySection()] });
  };

  const updateQuestion = (sid: string, pid: string, statement: string) => {
    const section = value.sections.find((s) => s.id === sid);
    if (!section) return;
    updateSection(sid, { questions: section.questions.map((p) => (p.id === pid ? { ...p, statement } : p)) });
  };
  const addQuestion = (sid: string) => {
    const section = value.sections.find((s) => s.id === sid);
    if (!section) return;
    updateSection(sid, { questions: [...section.questions, emptyQualityQuestion()] });
  };
  const removeQuestion = (sid: string, pid: string) => {
    const section = value.sections.find((s) => s.id === sid);
    if (!section) return;
    const next = section.questions.filter((p) => p.id !== pid);
    updateSection(sid, { questions: next.length > 0 ? next : [emptyQualityQuestion()] });
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

      <Section title="Encabezado del cuestionario">
        <Input label="Título del cuestionario" value={value.questionnaireTitle} onChange={(e) => set({ questionnaireTitle: e.target.value })} />
        <Textarea
          label="Instrucciones"
          value={value.instructions}
          className="min-h-[80px]"
          onChange={(e) => set({ instructions: e.target.value })}
        />
      </Section>

      <Section title="Escala de respuesta (común a todas las preguntas)">
        <div className="space-y-2">
          {value.scale.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-sm font-semibold text-primary">{optionLetter(i)}.</span>
              <div className="flex-1">
                <Input value={o} placeholder={`Opción ${optionLetter(i)}`} onChange={(e) => updateScale(i, e.target.value)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeScale(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addScale}>
            <Plus className="h-4 w-4" /> Agregar opción
          </Button>
        </div>
      </Section>

      <Section title="Secciones y preguntas">
        <div className="space-y-4">
          {value.sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-end gap-2">
                <div className="flex-1">
                  <Input label="Sección" value={section.title} placeholder="Ej. Instructor" onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {section.questions.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">{idx + 1}.</span>
                    <div className="flex-1">
                      <Input value={p.statement} placeholder="Escribe la pregunta" onChange={(e) => updateQuestion(section.id, p.id, e.target.value)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeQuestion(section.id, p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addQuestion(section.id)}>
                  <Plus className="h-4 w-4" /> Agregar pregunta
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addSection}>
            <Plus className="h-4 w-4" /> Agregar sección
          </Button>
        </div>
      </Section>
    </div>
  );
}
