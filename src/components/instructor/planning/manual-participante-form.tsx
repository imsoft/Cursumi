"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ManualParticipanteData,
  type NivelSeccion,
  emptySeccionManual,
} from "@/lib/planning/manual-participante";

type Props = {
  value: ManualParticipanteData;
  onChange: (next: ManualParticipanteData) => void;
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

export function ManualParticipanteForm({ value, onChange }: Props) {
  const set = (patch: Partial<ManualParticipanteData>) => onChange({ ...value, ...patch });

  const updateSeccion = (id: string, patch: Partial<{ nivel: NivelSeccion; titulo: string; cuerpo: string }>) =>
    set({ secciones: value.secciones.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addSeccion = (nivel: NivelSeccion) => set({ secciones: [...value.secciones, emptySeccionManual(nivel)] });
  const removeSeccion = (id: string) => {
    const next = value.secciones.filter((s) => s.id !== id);
    set({ secciones: next.length > 0 ? next : [emptySeccionManual(1)] });
  };
  const moveSeccion = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.secciones.length) return;
    const next = [...value.secciones];
    [next[index], next[target]] = [next[target], next[index]];
    set({ secciones: next });
  };

  const updateBib = (idx: number, texto: string) => set({ bibliografia: value.bibliografia.map((b, i) => (i === idx ? texto : b)) });
  const addBib = () => set({ bibliografia: [...value.bibliografia, ""] });
  const removeBib = (idx: number) => {
    const next = value.bibliografia.filter((_, i) => i !== idx);
    set({ bibliografia: next.length > 0 ? next : [""] });
  };

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <Input label="Nombre del curso" value={value.nombreCurso} onChange={(e) => set({ nombreCurso: e.target.value })} />
        <Textarea
          label="Estándar de referencia (portada)"
          value={value.estandarReferencia}
          placeholder="Ej. EC0754 Implementación de la educación financiera con enfoque productivo para trabajadores"
          className="min-h-[60px]"
          onChange={(e) => set({ estandarReferencia: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={value.mostrarContenido}
            onChange={(e) => set({ mostrarContenido: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          Incluir página de “Contenido” (índice) al inicio
        </label>
      </Section>

      <Section title="Secciones del manual">
        <p className="text-xs text-muted-foreground">
          Usa “Sección” para títulos principales (Presentación, Introducción, Desarrollo…) y “Subsección” para apartados internos
          (Bienvenida, Tema 1…). En el cuerpo, separa los párrafos con un salto de línea. El índice se genera automáticamente.
        </p>
        <div className="space-y-4">
          {value.secciones.map((s, idx) => (
            <div key={s.id} className={cn("rounded-xl border border-border bg-background p-4", s.nivel === 2 && "ml-4 border-l-4 border-l-primary/40")}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => updateSeccion(s.id, { nivel: 1 })}
                    className={cn("rounded-md px-3 py-1 text-xs font-medium transition", s.nivel === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    Sección
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSeccion(s.id, { nivel: 2 })}
                    className={cn("rounded-md px-3 py-1 text-xs font-medium transition", s.nivel === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    Subsección
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" disabled={idx === 0} onClick={() => moveSeccion(idx, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={idx === value.secciones.length - 1} onClick={() => moveSeccion(idx, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeSeccion(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Input value={s.titulo} placeholder={s.nivel === 1 ? "Título de la sección" : "Título de la subsección"} onChange={(e) => updateSeccion(s.id, { titulo: e.target.value })} />
              <Textarea
                value={s.cuerpo}
                placeholder="Contenido (separa los párrafos con saltos de línea)"
                className="mt-3 min-h-[100px]"
                onChange={(e) => updateSeccion(s.id, { cuerpo: e.target.value })}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addSeccion(1)}>
              <Plus className="h-4 w-4" /> Agregar sección
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addSeccion(2)}>
              <Plus className="h-4 w-4" /> Agregar subsección
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Bibliografía">
        <div className="space-y-2">
          {value.bibliografia.map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 w-5 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
              <div className="flex-1">
                <Textarea value={b} placeholder="Referencia en formato APA" className="min-h-[50px]" onChange={(e) => updateBib(i, e.target.value)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 text-destructive hover:text-destructive"
                onClick={() => removeBib(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addBib}>
            <Plus className="h-4 w-4" /> Agregar referencia
          </Button>
        </div>
      </Section>
    </div>
  );
}
