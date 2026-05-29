"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type GuiaActividadesData,
  type UnidadAprendizaje,
  type ActividadUnidad,
  type CriteriosEvaluacion,
  emptyActividad,
  emptyUnidad,
} from "@/lib/planning/guia-actividades";

type Props = {
  value: GuiaActividadesData;
  onChange: (next: GuiaActividadesData) => void;
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

const CRITERIOS: { key: keyof CriteriosEvaluacion; label: string }[] = [
  { key: "conocimientos", label: "Conocimientos" },
  { key: "habilidades", label: "Habilidades" },
  { key: "actitudes", label: "Actitudes" },
];

export function GuiaActividadesForm({ value, onChange }: Props) {
  const set = (patch: Partial<GuiaActividadesData>) => onChange({ ...value, ...patch });

  const updateUnidad = (id: string, patch: Partial<UnidadAprendizaje>) =>
    set({ unidades: value.unidades.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  const addUnidad = () => set({ unidades: [...value.unidades, emptyUnidad()] });
  const removeUnidad = (id: string) => {
    const next = value.unidades.filter((u) => u.id !== id);
    set({ unidades: next.length > 0 ? next : [emptyUnidad()] });
  };

  const toggleCriterio = (uid: string, key: keyof CriteriosEvaluacion) => {
    const unidad = value.unidades.find((u) => u.id === uid);
    if (!unidad) return;
    updateUnidad(uid, { criterios: { ...unidad.criterios, [key]: !unidad.criterios[key] } });
  };

  const updateActividad = (uid: string, aid: string, patch: Partial<ActividadUnidad>) => {
    const unidad = value.unidades.find((u) => u.id === uid);
    if (!unidad) return;
    updateUnidad(uid, { actividades: unidad.actividades.map((a) => (a.id === aid ? { ...a, ...patch } : a)) });
  };
  const addActividad = (uid: string) => {
    const unidad = value.unidades.find((u) => u.id === uid);
    if (!unidad) return;
    updateUnidad(uid, { actividades: [...unidad.actividades, emptyActividad()] });
  };
  const removeActividad = (uid: string, aid: string) => {
    const unidad = value.unidades.find((u) => u.id === uid);
    if (!unidad) return;
    const next = unidad.actividades.filter((a) => a.id !== aid);
    updateUnidad(uid, { actividades: next.length > 0 ? next : [emptyActividad()] });
  };

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <Input label="Nombre del curso" value={value.nombreCurso} onChange={(e) => set({ nombreCurso: e.target.value })} />
      </Section>

      {value.unidades.map((unidad, idx) => (
        <Section key={unidad.id} title={unidad.nombre ? `Unidad: ${unidad.nombre}` : `Unidad ${idx + 1}`}>
          <div className="flex items-start justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => removeUnidad(unidad.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar unidad
            </Button>
          </div>

          <Input label="Nombre de la unidad de aprendizaje" value={unidad.nombre} onChange={(e) => updateUnidad(unidad.id, { nombre: e.target.value })} />
          <Textarea
            label="Objetivo específico de la unidad"
            value={unidad.objetivo}
            className="min-h-[70px]"
            onChange={(e) => updateUnidad(unidad.id, { objetivo: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Periodo de realización de actividades" value={unidad.periodo} onChange={(e) => updateUnidad(unidad.id, { periodo: e.target.value })} />
            <Input label="Ponderación general de actividades" value={unidad.ponderacionGeneral} placeholder="Ej. 50%" onChange={(e) => updateUnidad(unidad.id, { ponderacionGeneral: e.target.value })} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Criterios de evaluación de actividades</p>
            <div className="flex flex-wrap gap-2">
              {CRITERIOS.map((c) => {
                const active = unidad.criterios[c.key];
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggleCriterio(unidad.id, c.key)}
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
            {unidad.actividades.map((a, aIdx) => (
              <div key={a.id} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Actividad {aIdx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeActividad(unidad.id, a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input label="Título de la actividad" value={a.titulo} onChange={(e) => updateActividad(unidad.id, a.id, { titulo: e.target.value })} />
                  <Textarea label="Instrucciones" value={a.instrucciones} className="min-h-[60px]" onChange={(e) => updateActividad(unidad.id, a.id, { instrucciones: e.target.value })} />
                  <Textarea label="Materiales o recurso (una por línea)" value={a.materiales} className="min-h-[60px]" onChange={(e) => updateActividad(unidad.id, a.id, { materiales: e.target.value })} />
                  <Input label="Forma de participación (individual o colaborativa)" value={a.participacion} onChange={(e) => updateActividad(unidad.id, a.id, { participacion: e.target.value })} />
                  <Textarea label="Medio & tiempo de entrega" value={a.medioTiempo} className="min-h-[60px]" onChange={(e) => updateActividad(unidad.id, a.id, { medioTiempo: e.target.value })} />
                  <Textarea label="Ponderación de actividad & criterios de evaluación" value={a.ponderacion} className="min-h-[60px]" onChange={(e) => updateActividad(unidad.id, a.id, { ponderacion: e.target.value })} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addActividad(unidad.id)}>
              <Plus className="h-4 w-4" /> Agregar actividad
            </Button>
          </div>
        </Section>
      ))}

      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addUnidad}>
        <Plus className="h-4 w-4" /> Agregar unidad
      </Button>
    </div>
  );
}
