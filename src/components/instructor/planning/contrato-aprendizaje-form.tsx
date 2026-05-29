"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type ContratoAprendizajeData,
  type CompromisoRow,
  emptyCompromiso,
} from "@/lib/planning/contrato-aprendizaje";

type Props = {
  value: ContratoAprendizajeData;
  onChange: (next: ContratoAprendizajeData) => void;
};

type CompromisoKey = "compromisosFacilitador" | "compromisosParticipante";

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

export function ContratoAprendizajeForm({ value, onChange }: Props) {
  const set = (patch: Partial<ContratoAprendizajeData>) => onChange({ ...value, ...patch });

  const updateRow = (key: CompromisoKey, id: string, descripcion: string) =>
    set({ [key]: value[key].map((r) => (r.id === id ? { ...r, descripcion } : r)) } as Partial<ContratoAprendizajeData>);

  const addRow = (key: CompromisoKey) =>
    set({ [key]: [...value[key], emptyCompromiso()] } as Partial<ContratoAprendizajeData>);

  const removeRow = (key: CompromisoKey, id: string) => {
    const rows = value[key].filter((r) => r.id !== id);
    set({ [key]: rows.length > 0 ? rows : [emptyCompromiso()] } as Partial<ContratoAprendizajeData>);
  };

  const renderCompromisos = (key: CompromisoKey) => (
    <div className="space-y-2">
      {value[key].map((r: CompromisoRow, idx) => (
        <div key={r.id} className="flex items-start gap-2">
          <span className="mt-2.5 w-6 shrink-0 text-right text-sm text-muted-foreground">{idx + 1}.</span>
          <div className="flex-1">
            <Textarea
              value={r.descripcion}
              placeholder="Describe el compromiso"
              className="min-h-[60px]"
              onChange={(e) => updateRow(key, r.id, e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 text-destructive hover:text-destructive"
            onClick={() => removeRow(key, r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addRow(key)}>
        <Plus className="h-4 w-4" /> Agregar compromiso
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nombre del curso / sesión" value={value.nombreCurso} onChange={(e) => set({ nombreCurso: e.target.value })} />
          <Input label="Nombre del facilitador / instructor" value={value.nombreInstructor} onChange={(e) => set({ nombreInstructor: e.target.value })} />
          <Input label="Lugar de impartición" value={value.lugar} onChange={(e) => set({ lugar: e.target.value })} />
          <Input label="Duración del curso / sesión" value={value.duracion} placeholder="Ej. 180 min" onChange={(e) => set({ duracion: e.target.value })} />
          <Input label="Horario" value={value.horario} placeholder="Ej. 11:00 am" onChange={(e) => set({ horario: e.target.value })} />
          <Input label="Fecha de impartición" value={value.fecha} placeholder="Ej. 28 de febrero de 2025" onChange={(e) => set({ fecha: e.target.value })} />
        </div>
      </Section>

      <Section title="1. Compromisos del facilitador / instructor">
        {renderCompromisos("compromisosFacilitador")}
      </Section>

      <Section title="2. Compromisos del participante">
        {renderCompromisos("compromisosParticipante")}
      </Section>
    </div>
  );
}
