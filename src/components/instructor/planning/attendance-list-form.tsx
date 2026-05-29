"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type AttendanceListData,
  emptyRow,
} from "@/lib/planning/attendance-list";

type Props = {
  value: AttendanceListData;
  onChange: (next: AttendanceListData) => void;
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

export function AttendanceListForm({ value, onChange }: Props) {
  const set = (patch: Partial<AttendanceListData>) => onChange({ ...value, ...patch });

  const updateRow = (id: string, name: string) =>
    set({ participants: value.participants.map((p) => (p.id === id ? { ...p, name } : p)) });

  const removeRow = (id: string) => {
    const rows = value.participants.filter((p) => p.id !== id);
    set({ participants: rows.length > 0 ? rows : [emptyRow()] });
  };

  const addRows = (n: number) =>
    set({ participants: [...value.participants, ...Array.from({ length: n }, emptyRow)] });

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nombre del curso / sesión" value={value.courseName} onChange={(e) => set({ courseName: e.target.value })} />
          <Input label="Nombre del facilitador / instructor" value={value.instructorName} onChange={(e) => set({ instructorName: e.target.value })} />
          <Input label="Lugar de impartición" value={value.location} onChange={(e) => set({ location: e.target.value })} />
          <Input label="Duración del curso" value={value.duration} placeholder="Ej. 120 min" onChange={(e) => set({ duration: e.target.value })} />
          <Input label="Horario" value={value.schedule} placeholder="Ej. 11:00 am" onChange={(e) => set({ schedule: e.target.value })} />
          <Input label="Fecha de impartición" value={value.date} placeholder="Ej. 29 de enero de 2025" onChange={(e) => set({ date: e.target.value })} />
        </div>
      </Section>

      <Section title="Participantes">
        <p className="text-sm text-muted-foreground">
          Escribe los nombres si los conoces, o deja filas en blanco para que firmen el día del curso.
          La columna de firma siempre se imprime vacía.
        </p>
        <div className="space-y-2">
          {value.participants.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">{idx + 1}.</span>
              <div className="flex-1">
                <Input value={p.name} placeholder="Nombre del participante (opcional)" onChange={(e) => updateRow(p.id, e.target.value)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeRow(p.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addRows(1)}>
            <Plus className="h-4 w-4" /> Agregar fila
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addRows(5)}>
            <Plus className="h-4 w-4" /> Agregar 5 filas
          </Button>
        </div>
      </Section>
    </div>
  );
}
