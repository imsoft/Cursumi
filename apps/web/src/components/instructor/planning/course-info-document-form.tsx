"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import {
  type CourseInfoDocumentData,
  type CourseTopic,
  emptyTopic,
  emptyEvaluationItem,
} from "@/lib/planning/course-info-document";

type Props = {
  value: CourseInfoDocumentData;
  onChange: (next: CourseInfoDocumentData) => void;
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function CourseInfoDocumentForm({ value, onChange }: Props) {
  const set = <K extends keyof CourseInfoDocumentData>(key: K, val: CourseInfoDocumentData[K]) =>
    onChange({ ...value, [key]: val });

  const updateTopic = (id: string, patch: Partial<CourseTopic>) =>
    onChange({ ...value, topics: value.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) });

  const removeTopic = (id: string) =>
    onChange({ ...value, topics: value.topics.filter((t) => t.id !== id) });

  const addTopic = () =>
    onChange({ ...value, topics: [...value.topics, emptyTopic()] });

  const updateEvalItem = (id: string, text: string) =>
    onChange({ ...value, evaluationItems: value.evaluationItems.map((e) => (e.id === id ? { ...e, text } : e)) });

  const removeEvalItem = (id: string) =>
    onChange({ ...value, evaluationItems: value.evaluationItems.filter((e) => e.id !== id) });

  const addEvalItem = () =>
    onChange({ ...value, evaluationItems: [...value.evaluationItems, emptyEvaluationItem()] });

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <Section title="Información del curso">
        <Field label="Nombre del curso">
          <Input value={value.courseName} onChange={(e) => set("courseName", e.target.value)} />
        </Field>
        <Field label="Objetivo general">
          <Textarea value={value.generalObjective} onChange={(e) => set("generalObjective", e.target.value)} rows={3} className="resize-none" />
        </Field>
      </Section>

      {/* ── Temas ── */}
      <Section title="Temas">
        <div className="space-y-4">
          {value.topics.map((topic, i) => (
            <div key={topic.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Tema {i + 1}</span>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeTopic(topic.id)}
                  disabled={value.topics.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Field label="Título del tema">
                <Input value={topic.title} onChange={(e) => updateTopic(topic.id, { title: e.target.value })} />
              </Field>
              <Field label="Objetivo particular">
                <Textarea value={topic.objective} onChange={(e) => updateTopic(topic.id, { objective: e.target.value })} rows={3} className="resize-none" />
              </Field>
              <Field label="Horas">
                <Input
                  type="number" min={0} value={topic.hours}
                  onChange={(e) => updateTopic(topic.id, { hours: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-24"
                />
              </Field>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={addTopic}>
          <PlusCircle className="h-4 w-4" /> Agregar tema
        </Button>
      </Section>

      {/* ── Secciones de texto ── */}
      <Section title="Introducción al curso">
        <Textarea value={value.introduction} onChange={(e) => set("introduction", e.target.value)} rows={6} className="resize-y" />
      </Section>

      <Section title="Metodología de trabajo">
        <Textarea value={value.methodology} onChange={(e) => set("methodology", e.target.value)} rows={5} className="resize-y" />
      </Section>

      <Section title="Guía visual">
        <Textarea value={value.visualGuide} onChange={(e) => set("visualGuide", e.target.value)} rows={2} className="resize-none" />
      </Section>

      {/* ── Perfil de ingreso ── */}
      <Section title="Perfil de ingreso">
        <Field label="Descripción del perfil">
          <Textarea value={value.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} rows={3} className="resize-none" />
        </Field>
        <Field label="Conocimientos previos" hint="Deja en blanco si no aplica">
          <Input value={value.noPriorKnowledge} onChange={(e) => set("noPriorKnowledge", e.target.value)} />
        </Field>
        <Field label="Habilidades requeridas" hint="Una por línea">
          <Textarea value={value.requiredSkills} onChange={(e) => set("requiredSkills", e.target.value)} rows={3} className="resize-none" />
        </Field>
        <Field label="Material necesario" hint="Una por línea">
          <Textarea value={value.requiredMaterials} onChange={(e) => set("requiredMaterials", e.target.value)} rows={3} className="resize-none" />
        </Field>
      </Section>

      {/* ── Evaluación ── */}
      <Section title="Evaluación">
        <div className="space-y-2">
          {value.evaluationItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                value={item.text}
                onChange={(e) => updateEvalItem(item.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeEvalItem(item.id)}
                disabled={value.evaluationItems.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2 mt-2" onClick={addEvalItem}>
          <PlusCircle className="h-4 w-4" /> Agregar ítem
        </Button>
      </Section>

      {/* ── Duración ── */}
      <Section title="Duración del curso">
        <div className="flex flex-wrap gap-6">
          <Field label="Horas totales" hint="Se calcula de la suma de los temas">
            <div className="flex h-9 w-24 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
              {value.topics.reduce((s, t) => s + (t.hours || 0), 0)}
            </div>
          </Field>
          <Field label="Días">
            <Input
              type="number" min={0} value={value.durationDays}
              onChange={(e) => set("durationDays", Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24"
            />
          </Field>
        </div>
      </Section>

      {/* ── Firma ── */}
      <Section title="Firma">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input value={value.developerName} onChange={(e) => set("developerName", e.target.value)} />
          </Field>
          <Field label="Rol">
            <Input value={value.developerRole} onChange={(e) => set("developerRole", e.target.value)} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
