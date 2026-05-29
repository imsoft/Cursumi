"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  type VirtualActivitiesGuideData,
  type VirtualLearningUnit,
  type VirtualActivity,
  emptyVirtualActivity,
  emptyVirtualUnit,
} from "@/lib/planning/virtual-activities-guide";

type Props = {
  value: VirtualActivitiesGuideData;
  onChange: (next: VirtualActivitiesGuideData) => void;
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

function ActivityRow({
  activity,
  onUpdate,
  onRemove,
  canRemove,
}: {
  activity: VirtualActivity;
  onUpdate: (patch: Partial<VirtualActivity>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary">Actividad</span>
        <Button
          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove} disabled={!canRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título de la actividad">
          <Input value={activity.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="Forma de participación">
          <Input value={activity.participation} onChange={(e) => onUpdate({ participation: e.target.value })} className="h-8 text-sm" />
        </Field>
      </div>
      <Field label="Instrucciones">
        <Textarea value={activity.instructions} onChange={(e) => onUpdate({ instructions: e.target.value })} rows={3} className="resize-none text-sm" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Materiales o recurso" hint="Un ítem por línea">
          <Textarea value={activity.materials} onChange={(e) => onUpdate({ materials: e.target.value })} rows={3} className="resize-none text-sm" />
        </Field>
        <Field label="Medio de entrega">
          <Textarea value={activity.deliveryMethod} onChange={(e) => onUpdate({ deliveryMethod: e.target.value })} rows={3} className="resize-none text-sm" />
        </Field>
      </div>
      <Field label="Ponderación de actividad">
        <Input value={activity.weight} onChange={(e) => onUpdate({ weight: e.target.value })} className="h-8 w-28 text-sm" />
      </Field>
    </div>
  );
}

function UnitBlock({
  unit,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  unit: VirtualLearningUnit;
  index: number;
  onUpdate: (patch: Partial<VirtualLearningUnit>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [open, setOpen] = useState(true);

  const updateActivity = (id: string, patch: Partial<VirtualActivity>) =>
    onUpdate({
      activities: unit.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });

  const removeActivity = (id: string) =>
    onUpdate({ activities: unit.activities.filter((a) => a.id !== id) });

  const addActivity = () =>
    onUpdate({ activities: [...unit.activities, emptyVirtualActivity()] });

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      {/* Header del bloque */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-primary/8 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold text-foreground">Unidad {index + 1}: {unit.name || "Sin nombre"}</span>
        <div className="flex items-center gap-2">
          {canRemove && (
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

      {open && (
        <div className="p-5 space-y-5">
          {/* Datos de la unidad */}
          <div className="grid gap-4">
            <Field label="Nombre de la unidad de aprendizaje">
              <Input value={unit.name} onChange={(e) => onUpdate({ name: e.target.value })} />
            </Field>
            <Field label="Objetivo específico de la unidad">
              <Textarea value={unit.specificObjective} onChange={(e) => onUpdate({ specificObjective: e.target.value })} rows={3} className="resize-none" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Período de realización de actividades">
                <Input value={unit.activityPeriod} onChange={(e) => onUpdate({ activityPeriod: e.target.value })} />
              </Field>
              <Field label="Ponderación general de actividades">
                <Input value={unit.generalWeight} onChange={(e) => onUpdate({ generalWeight: e.target.value })} className="w-32" />
              </Field>
            </div>

            {/* Criterios */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Criterios de evaluación de actividades</Label>
              <div className="flex flex-wrap gap-6">
                {(["knowledge", "skills", "attitudes"] as const).map((key) => {
                  const labels = { knowledge: "Conocimientos", skills: "Habilidades", attitudes: "Actitudes" };
                  return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={unit.criteria[key]}
                        onChange={(e) => onUpdate({ criteria: { ...unit.criteria, [key]: e.target.checked } })}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">{labels[key]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actividades */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Actividades de la unidad</h4>
            {unit.activities.map((a) => (
              <ActivityRow
                key={a.id}
                activity={a}
                onUpdate={(patch) => updateActivity(a.id, patch)}
                onRemove={() => removeActivity(a.id)}
                canRemove={unit.activities.length > 1}
              />
            ))}
            <Button variant="outline" size="sm" className="gap-2" onClick={addActivity}>
              <PlusCircle className="h-4 w-4" /> Agregar actividad
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function VirtualActivitiesGuideForm({ value, onChange }: Props) {
  const updateUnit = (id: string, patch: Partial<VirtualLearningUnit>) =>
    onChange({ ...value, units: value.units.map((u) => (u.id === id ? { ...u, ...patch } : u)) });

  const removeUnit = (id: string) =>
    onChange({ ...value, units: value.units.filter((u) => u.id !== id) });

  const addUnit = () =>
    onChange({ ...value, units: [...value.units, emptyVirtualUnit(value.units.length + 1)] });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Información del curso</h2>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Nombre del curso</Label>
          <Input value={value.courseName} onChange={(e) => onChange({ ...value, courseName: e.target.value })} />
        </div>
      </section>

      {/* Unidades */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Unidades de aprendizaje</h2>
        {value.units.map((unit, i) => (
          <UnitBlock
            key={unit.id}
            unit={unit}
            index={i}
            onUpdate={(patch) => updateUnit(unit.id, patch)}
            onRemove={() => removeUnit(unit.id)}
            canRemove={value.units.length > 1}
          />
        ))}
        <Button variant="outline" size="sm" className="gap-2" onClick={addUnit}>
          <PlusCircle className="h-4 w-4" /> Agregar unidad
        </Button>
      </div>
    </div>
  );
}
