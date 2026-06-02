"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  type ActivityCalendarData,
  type CalendarUnit,
  type CalendarActivity,
  emptyCalendarActivity,
  emptyCalendarUnit,
} from "@/lib/planning/activity-calendar";

type Props = {
  value: ActivityCalendarData;
  onChange: (next: ActivityCalendarData) => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
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
  unit: CalendarUnit;
  index: number;
  onUpdate: (patch: Partial<CalendarUnit>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [open, setOpen] = useState(true);

  const updateActivity = (id: string, patch: Partial<CalendarActivity>) =>
    onUpdate({ activities: unit.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)) });

  const removeActivity = (id: string) =>
    onUpdate({ activities: unit.activities.filter((a) => a.id !== id) });

  const addActivity = () =>
    onUpdate({ activities: [...unit.activities, emptyCalendarActivity()] });

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 bg-primary/8 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold text-foreground">
          Unidad {index + 1}: {unit.name || "Sin nombre"}
        </span>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre de la unidad">
              <Input value={unit.name} onChange={(e) => onUpdate({ name: e.target.value })} />
            </Field>
            <Field label="Fecha programada">
              <Input type="date" value={unit.scheduledDate} onChange={(e) => onUpdate({ scheduledDate: e.target.value })} />
            </Field>
          </div>

          {/* Actividades */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Actividades</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="pb-2 text-left font-medium pr-3">Nombre de la actividad</th>
                    <th className="pb-2 text-center font-medium px-2 w-28">Ponderación</th>
                    <th className="pb-2 text-center font-medium px-2 w-36">Período de realización</th>
                    <th className="pb-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {unit.activities.map((a) => (
                    <tr key={a.id} className="align-middle">
                      <td className="py-2 pr-3">
                        <Input value={a.name} onChange={(e) => updateActivity(a.id, { name: e.target.value })} className="h-8 text-sm" />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Input value={a.weight} onChange={(e) => updateActivity(a.id, { weight: e.target.value })} className="h-8 w-24 text-sm text-center" />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Input value={a.duration} onChange={(e) => updateActivity(a.id, { duration: e.target.value })} className="h-8 text-sm" placeholder="ej. 60 minutos" />
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeActivity(a.id)}
                          disabled={unit.activities.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={addActivity}>
              <PlusCircle className="h-4 w-4" /> Agregar actividad
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityCalendarForm({ value, onChange }: Props) {
  const updateUnit = (id: string, patch: Partial<CalendarUnit>) =>
    onChange({ ...value, units: value.units.map((u) => (u.id === id ? { ...u, ...patch } : u)) });

  const removeUnit = (id: string) =>
    onChange({ ...value, units: value.units.filter((u) => u.id !== id) });

  const addUnit = () =>
    onChange({ ...value, units: [...value.units, emptyCalendarUnit()] });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Información del curso</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del curso">
            <Input value={value.courseName} onChange={(e) => onChange({ ...value, courseName: e.target.value })} />
          </Field>
          <Field label="Ponderación general de actividades">
            <Input value={value.generalWeight} onChange={(e) => onChange({ ...value, generalWeight: e.target.value })} className="w-32" />
          </Field>
        </div>
      </section>

      {/* Unidades */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Unidades y actividades</h2>
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
