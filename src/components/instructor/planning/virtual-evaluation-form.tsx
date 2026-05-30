"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  type VirtualEvaluationData,
  type KnowledgeEvaluation,
  type EvaluationQuestion,
  type QualitySection,
  emptyKnowledgeEvaluation,
  emptyEvaluationQuestion,
  emptyEvaluationOption,
  emptyQualitySection,
  emptyQualityQuestion,
  optionLetter,
} from "@/lib/planning/virtual-evaluation";

type Props = {
  value: VirtualEvaluationData;
  onChange: (next: VirtualEvaluationData) => void;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Collapsible({
  title,
  onRemove,
  canRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  canRemove?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 bg-primary/8 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {canRemove && onRemove && (
            <Button
              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function QuestionEditor({
  question,
  onUpdate,
  onRemove,
  canRemove,
}: {
  question: EvaluationQuestion;
  onUpdate: (patch: Partial<EvaluationQuestion>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const setCorrect = (optionId: string) =>
    onUpdate({ options: question.options.map((o) => ({ ...o, correct: o.id === optionId })) });

  const updateOptionText = (optionId: string, text: string) =>
    onUpdate({ options: question.options.map((o) => (o.id === optionId ? { ...o, text } : o)) });

  const removeOption = (optionId: string) =>
    onUpdate({ options: question.options.filter((o) => o.id !== optionId) });

  const addOption = () =>
    onUpdate({ options: [...question.options, emptyEvaluationOption()] });

  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Textarea
          value={question.statement}
          onChange={(e) => onUpdate({ statement: e.target.value })}
          rows={2}
          className="flex-1 resize-none text-sm"
          placeholder="Enunciado de la pregunta"
        />
        <Button
          variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove} disabled={!canRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0" title="Marcar como correcta">
              <input
                type="radio"
                checked={opt.correct}
                onChange={() => setCorrect(opt.id)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-xs font-mono text-muted-foreground w-4">{optionLetter(i)})</span>
            </label>
            <Input
              value={opt.text}
              onChange={(e) => updateOptionText(opt.id, e.target.value)}
              className={`h-8 text-sm flex-1 ${opt.correct ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : ""}`}
              placeholder="Texto de la opción"
            />
            <Button
              variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeOption(opt.id)} disabled={question.options.length <= 2}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={addOption}>
        <PlusCircle className="h-3.5 w-3.5" /> Agregar opción
      </Button>
    </div>
  );
}

export function VirtualEvaluationForm({ value, onChange }: Props) {
  const set = <K extends keyof VirtualEvaluationData>(key: K, val: VirtualEvaluationData[K]) =>
    onChange({ ...value, [key]: val });

  // Knowledge evaluations
  const updateEval = (id: string, patch: Partial<KnowledgeEvaluation>) =>
    onChange({ ...value, knowledgeEvaluations: value.knowledgeEvaluations.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)) });

  const removeEval = (id: string) =>
    onChange({ ...value, knowledgeEvaluations: value.knowledgeEvaluations.filter((ev) => ev.id !== id) });

  const addEval = () =>
    onChange({ ...value, knowledgeEvaluations: [...value.knowledgeEvaluations, emptyKnowledgeEvaluation(value.knowledgeEvaluations.length + 1)] });

  // Quality sections
  const updateSection = (id: string, patch: Partial<QualitySection>) =>
    onChange({ ...value, qualitySections: value.qualitySections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const removeSection = (id: string) =>
    onChange({ ...value, qualitySections: value.qualitySections.filter((s) => s.id !== id) });

  const addSection = () =>
    onChange({ ...value, qualitySections: [...value.qualitySections, emptyQualitySection()] });

  const updateScaleItem = (i: number, text: string) => {
    const next = [...value.qualityScale];
    next[i] = text;
    set("qualityScale", next);
  };

  return (
    <div className="space-y-6">
      {/* ── Portada ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Portada</h2>
        <Field label="Nombre del curso">
          <Input value={value.courseName} onChange={(e) => set("courseName", e.target.value)} />
        </Field>
        <Field label="Estándar de referencia" hint="Ej. EC0754 Implementación de la educación financiera…">
          <Textarea value={value.referenceStandard} onChange={(e) => set("referenceStandard", e.target.value)} rows={2} className="resize-none" />
        </Field>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={value.showTableOfContents}
            onChange={(e) => set("showTableOfContents", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Mostrar tabla de contenido
        </label>
      </section>

      {/* ── Presentación ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Presentación</h2>
        <Textarea value={value.presentation} onChange={(e) => set("presentation", e.target.value)} rows={6} className="resize-y" />
      </section>

      {/* ── Evaluaciones de conocimiento ── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Evaluaciones de conocimiento</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Marca con el botón de radio la opción correcta de cada pregunta (se resaltará en amarillo en el PDF).
        </p>
        {value.knowledgeEvaluations.map((ev, i) => (
          <Collapsible
            key={ev.id}
            title={ev.title || `Evaluación ${i + 1}`}
            onRemove={() => removeEval(ev.id)}
            canRemove={value.knowledgeEvaluations.length > 1}
          >
            <Field label="Título de la evaluación">
              <Input value={ev.title} onChange={(e) => updateEval(ev.id, { title: e.target.value })} />
            </Field>
            <Field label="Instrucciones">
              <Textarea value={ev.instructions} onChange={(e) => updateEval(ev.id, { instructions: e.target.value })} rows={3} className="resize-none" />
            </Field>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preguntas</Label>
              {ev.questions.map((q) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  onUpdate={(patch) => updateEval(ev.id, { questions: ev.questions.map((qq) => (qq.id === q.id ? { ...qq, ...patch } : qq)) })}
                  onRemove={() => updateEval(ev.id, { questions: ev.questions.filter((qq) => qq.id !== q.id) })}
                  canRemove={ev.questions.length > 1}
                />
              ))}
              <Button
                variant="outline" size="sm" className="gap-2"
                onClick={() => updateEval(ev.id, { questions: [...ev.questions, emptyEvaluationQuestion()] })}
              >
                <PlusCircle className="h-4 w-4" /> Agregar pregunta
              </Button>
            </div>
          </Collapsible>
        ))}
        <Button variant="outline" size="sm" className="gap-2" onClick={addEval}>
          <PlusCircle className="h-4 w-4" /> Agregar evaluación de tema
        </Button>
      </div>

      {/* ── Cuestionario de calidad ── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Cuestionario de calidad</h2>

        <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
          <Field label="Instrucciones">
            <Textarea value={value.qualityInstructions} onChange={(e) => set("qualityInstructions", e.target.value)} rows={3} className="resize-none" />
          </Field>
          <Field label="Escala de calificación" hint="Opciones de respuesta compartidas por todas las preguntas">
            <div className="flex flex-wrap gap-2">
              {value.qualityScale.map((item, i) => (
                <Input
                  key={i}
                  value={item}
                  onChange={(e) => updateScaleItem(i, e.target.value)}
                  className="h-8 w-32 text-sm"
                />
              ))}
            </div>
          </Field>
        </section>

        {value.qualitySections.map((section, i) => (
          <Collapsible
            key={section.id}
            title={section.title || `Sección ${i + 1}`}
            onRemove={() => removeSection(section.id)}
            canRemove={value.qualitySections.length > 1}
          >
            <Field label="Título de la sección">
              <Input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
            </Field>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preguntas</Label>
              {section.questions.map((q) => (
                <div key={q.id} className="flex items-start gap-2">
                  <Textarea
                    value={q.statement}
                    onChange={(e) => updateSection(section.id, { questions: section.questions.map((qq) => (qq.id === q.id ? { ...qq, statement: e.target.value } : qq)) })}
                    rows={2}
                    className="flex-1 resize-none text-sm"
                  />
                  <Button
                    variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => updateSection(section.id, { questions: section.questions.filter((qq) => qq.id !== q.id) })}
                    disabled={section.questions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline" size="sm" className="gap-2"
                onClick={() => updateSection(section.id, { questions: [...section.questions, emptyQualityQuestion()] })}
              >
                <PlusCircle className="h-4 w-4" /> Agregar pregunta
              </Button>
            </div>
          </Collapsible>
        ))}
        <Button variant="outline" size="sm" className="gap-2" onClick={addSection}>
          <PlusCircle className="h-4 w-4" /> Agregar sección
        </Button>
      </div>
    </div>
  );
}
