"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import {
  type ActivityScheduleData,
  type ScheduleActivity,
  emptyActivity,
} from "@/lib/planning/activity-schedule";

type Props = {
  value: ActivityScheduleData;
  onChange: (next: ActivityScheduleData) => void;
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

function NumInput({
  value,
  min = 0,
  onChange,
  className = "w-20",
}: {
  value: number;
  min?: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <Input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || min))}
      className={className}
    />
  );
}

export function ActivityScheduleForm({ value, onChange }: Props) {
  const set = <K extends keyof ActivityScheduleData>(key: K, val: ActivityScheduleData[K]) =>
    onChange({ ...value, [key]: val });

  const updateActivity = (id: string, patch: Partial<ScheduleActivity>) =>
    onChange({
      ...value,
      activities: value.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });

  const removeActivity = (id: string) =>
    onChange({ ...value, activities: value.activities.filter((a) => a.id !== id) });

  const addActivity = () =>
    onChange({ ...value, activities: [...value.activities, emptyActivity()] });

  return (
    <div className="space-y-8">
      {/* ── Información general ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Información general</h2>
        <Field label="Título del curso">
          <Input value={value.courseName} onChange={(e) => set("courseName", e.target.value)} />
        </Field>
        <Field label="Fecha de elaboración">
          <Input type="date" value={value.creationDate} onChange={(e) => set("creationDate", e.target.value)} className="w-48" />
        </Field>
        <Field label="Objetivo general del curso">
          <Textarea
            value={value.objective}
            onChange={(e) => set("objective", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </Field>
      </section>

      {/* ── Configuración del Gantt ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Configuración del cronograma</h2>
        <div className="flex flex-wrap gap-6">
          <Field label="Total de períodos" hint="Días hábiles que dura el proyecto">
            <NumInput value={value.totalPeriods} min={1} onChange={(n) => set("totalPeriods", n)} />
          </Field>
          <Field label="Período resaltado" hint="Columna a destacar en el diagrama">
            <NumInput value={value.highlightedPeriod} min={1} onChange={(n) => set("highlightedPeriod", Math.min(n, value.totalPeriods))} />
          </Field>
        </div>
      </section>

      {/* ── Actividades ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Actividades</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium pr-3">Actividad</th>
                <th className="pb-2 text-center font-medium px-2 w-24">Inicio plan</th>
                <th className="pb-2 text-center font-medium px-2 w-24">Duración plan</th>
                <th className="pb-2 text-center font-medium px-2 w-24">Inicio real</th>
                <th className="pb-2 text-center font-medium px-2 w-24">Duración real</th>
                <th className="pb-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {value.activities.map((a) => (
                <tr key={a.id} className="align-middle">
                  <td className="py-2 pr-3">
                    <Input
                      value={a.name}
                      onChange={(e) => updateActivity(a.id, { name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <NumInput value={a.planStart} min={1} onChange={(n) => updateActivity(a.id, { planStart: Math.min(n, value.totalPeriods) })} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <NumInput value={a.planDuration} min={1} onChange={(n) => updateActivity(a.id, { planDuration: n })} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <NumInput value={a.realStart} min={0} onChange={(n) => updateActivity(a.id, { realStart: n })} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <NumInput value={a.realDuration} min={0} onChange={(n) => updateActivity(a.id, { realDuration: n })} />
                  </td>
                  <td className="py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeActivity(a.id)}
                      disabled={value.activities.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Inicio real = 0 significa que la actividad aún no ha comenzado.
        </p>
        <Button variant="outline" size="sm" className="gap-2" onClick={addActivity}>
          <PlusCircle className="h-4 w-4" /> Agregar actividad
        </Button>
      </section>

      {/* ── Firmas ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Firmas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Elaborado por">
            <Input value={value.elaboratedBy} onChange={(e) => set("elaboratedBy", e.target.value)} />
          </Field>
          <Field label="Aprobado por">
            <Input value={value.approvedBy} onChange={(e) => set("approvedBy", e.target.value)} />
          </Field>
        </div>
      </section>
    </div>
  );
}
