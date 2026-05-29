"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ActivitiesGuideData,
  type LearningUnit,
  type UnitActivity,
  type EvaluationCriteria,
  emptyActivity,
  emptyUnit,
} from "@/lib/planning/activities-guide";

type Props = {
  value: ActivitiesGuideData;
  onChange: (next: ActivitiesGuideData) => void;
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

const CRITERIA: { key: keyof EvaluationCriteria; label: string }[] = [
  { key: "knowledge", label: "Conocimientos" },
  { key: "skills", label: "Habilidades" },
  { key: "attitudes", label: "Actitudes" },
];

export function ActivitiesGuideForm({ value, onChange }: Props) {
  const set = (patch: Partial<ActivitiesGuideData>) => onChange({ ...value, ...patch });

  const updateUnit = (id: string, patch: Partial<LearningUnit>) =>
    set({ units: value.units.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  const addUnit = () => set({ units: [...value.units, emptyUnit()] });
  const removeUnit = (id: string) => {
    const next = value.units.filter((u) => u.id !== id);
    set({ units: next.length > 0 ? next : [emptyUnit()] });
  };

  const toggleCriteria = (uid: string, key: keyof EvaluationCriteria) => {
    const unit = value.units.find((u) => u.id === uid);
    if (!unit) return;
    updateUnit(uid, { criteria: { ...unit.criteria, [key]: !unit.criteria[key] } });
  };

  const updateActivity = (uid: string, aid: string, patch: Partial<UnitActivity>) => {
    const unit = value.units.find((u) => u.id === uid);
    if (!unit) return;
    updateUnit(uid, { activities: unit.activities.map((a) => (a.id === aid ? { ...a, ...patch } : a)) });
  };
  const addActivity = (uid: string) => {
    const unit = value.units.find((u) => u.id === uid);
    if (!unit) return;
    updateUnit(uid, { activities: [...unit.activities, emptyActivity()] });
  };
  const removeActivity = (uid: string, aid: string) => {
    const unit = value.units.find((u) => u.id === uid);
    if (!unit) return;
    const next = unit.activities.filter((a) => a.id !== aid);
    updateUnit(uid, { activities: next.length > 0 ? next : [emptyActivity()] });
  };

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <Input label="Nombre del curso" value={value.courseName} onChange={(e) => set({ courseName: e.target.value })} />
      </Section>

      {value.units.map((unit, idx) => (
        <Section key={unit.id} title={unit.name ? `Unidad: ${unit.name}` : `Unidad ${idx + 1}`}>
          <div className="flex items-start justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => removeUnit(unit.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar unidad
            </Button>
          </div>

          <Input label="Nombre de la unidad de aprendizaje" value={unit.name} onChange={(e) => updateUnit(unit.id, { name: e.target.value })} />
          <Textarea
            label="Objetivo específico de la unidad"
            value={unit.objective}
            className="min-h-[70px]"
            onChange={(e) => updateUnit(unit.id, { objective: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Periodo de realización de actividades" value={unit.period} onChange={(e) => updateUnit(unit.id, { period: e.target.value })} />
            <Input label="Ponderación general de actividades" value={unit.generalWeight} placeholder="Ej. 50%" onChange={(e) => updateUnit(unit.id, { generalWeight: e.target.value })} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Criterios de evaluación de actividades</p>
            <div className="flex flex-wrap gap-2">
              {CRITERIA.map((c) => {
                const active = unit.criteria[c.key];
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggleCriteria(unit.id, c.key)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary",
                    )}
                  >
                    {active ? <Check className="h-4 w-4" /> : null}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Actividades</p>
            {unit.activities.map((a, aIdx) => (
              <div key={a.id} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Actividad {aIdx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeActivity(unit.id, a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input label="Título de la actividad" value={a.title} onChange={(e) => updateActivity(unit.id, a.id, { title: e.target.value })} />
                  <Textarea label="Instrucciones" value={a.instructions} className="min-h-[60px]" onChange={(e) => updateActivity(unit.id, a.id, { instructions: e.target.value })} />
                  <Textarea label="Materiales o recurso (una por línea)" value={a.materials} className="min-h-[60px]" onChange={(e) => updateActivity(unit.id, a.id, { materials: e.target.value })} />
                  <Input label="Forma de participación (individual o colaborativa)" value={a.participation} onChange={(e) => updateActivity(unit.id, a.id, { participation: e.target.value })} />
                  <Textarea label="Medio & tiempo de entrega" value={a.midTerm} className="min-h-[60px]" onChange={(e) => updateActivity(unit.id, a.id, { midTerm: e.target.value })} />
                  <Textarea label="Ponderación de actividad & criterios de evaluación" value={a.weight} className="min-h-[60px]" onChange={(e) => updateActivity(unit.id, a.id, { weight: e.target.value })} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addActivity(unit.id)}>
              <Plus className="h-4 w-4" /> Agregar actividad
            </Button>
          </div>
        </Section>
      ))}

      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addUnit}>
        <Plus className="h-4 w-4" /> Agregar unidad
      </Button>
    </div>
  );
}
