"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, X } from "lucide-react";
import {
  type ListaVerificacionData,
  type CategoriaKey,
  type EstadoRequerimiento,
  CATEGORIA_LABELS,
  CATEGORIA_ORDER,
  emptyItem,
} from "@/lib/planning/lista-verificacion";

type Props = {
  value: ListaVerificacionData;
  onChange: (next: ListaVerificacionData) => void;
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

function EstadoToggle({
  value,
  onChange,
}: {
  value: EstadoRequerimiento;
  onChange: (v: EstadoRequerimiento) => void;
}) {
  return (
    <div className="flex gap-1">
      <Button
        type="button"
        size="sm"
        variant={value === "existe" ? "default" : "outline"}
        className="h-8 gap-1 px-2"
        onClick={() => onChange(value === "existe" ? "" : "existe")}
      >
        <Check className="h-3.5 w-3.5" /> Existe
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "no_existe" ? "destructive" : "outline"}
        className="h-8 gap-1 px-2"
        onClick={() => onChange(value === "no_existe" ? "" : "no_existe")}
      >
        <X className="h-3.5 w-3.5" /> No existe
      </Button>
    </div>
  );
}

export function ListaVerificacionForm({ value, onChange }: Props) {
  const set = (patch: Partial<ListaVerificacionData>) => onChange({ ...value, ...patch });

  const updateItem = (key: CategoriaKey, id: string, patch: Partial<{ descripcion: string; estado: EstadoRequerimiento }>) =>
    set({ items: { ...value.items, [key]: value.items[key].map((it) => (it.id === id ? { ...it, ...patch } : it)) } });

  const addItem = (key: CategoriaKey) =>
    set({ items: { ...value.items, [key]: [...value.items[key], emptyItem()] } });

  const removeItem = (key: CategoriaKey, id: string) => {
    const rows = value.items[key].filter((it) => it.id !== id);
    set({ items: { ...value.items, [key]: rows.length > 0 ? rows : [emptyItem()] } });
  };

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nombre del curso / sesión" value={value.nombreCurso} onChange={(e) => set({ nombreCurso: e.target.value })} />
          <Input label="Nombre del facilitador / instructor" value={value.nombreInstructor} onChange={(e) => set({ nombreInstructor: e.target.value })} />
          <Input label="Lugar de impartición" value={value.lugar} onChange={(e) => set({ lugar: e.target.value })} />
          <Input label="Duración del curso" value={value.duracion} placeholder="Ej. 180 min" onChange={(e) => set({ duracion: e.target.value })} />
          <Input label="Horario" value={value.horario} placeholder="Ej. 11:00 am" onChange={(e) => set({ horario: e.target.value })} />
          <Input label="Fecha de impartición" value={value.fecha} placeholder="Ej. 28 de febrero de 2025" onChange={(e) => set({ fecha: e.target.value })} />
        </div>
      </Section>

      {CATEGORIA_ORDER.map((key, i) => (
        <Section key={key} title={`${i + 1}. ${CATEGORIA_LABELS[key]}`}>
          <div className="space-y-3">
            {value.items[key].map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Input
                    value={item.descripcion}
                    placeholder="Descripción del requerimiento"
                    onChange={(e) => updateItem(key, item.id, { descripcion: e.target.value })}
                  />
                </div>
                <EstadoToggle value={item.estado} onChange={(v) => updateItem(key, item.id, { estado: v })} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeItem(key, item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addItem(key)}>
              <Plus className="h-4 w-4" /> Agregar requerimiento
            </Button>
          </div>
        </Section>
      ))}
    </div>
  );
}
