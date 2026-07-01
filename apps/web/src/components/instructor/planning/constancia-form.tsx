"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ConstanciaData } from "@/lib/planning/constancia";

type Props = {
  value: ConstanciaData;
  onChange: (next: ConstanciaData) => void;
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

export function ConstanciaForm({ value, onChange }: Props) {
  const set = (patch: Partial<ConstanciaData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Section title="Datos de la constancia">
        <div className="space-y-1">
          <Input
            label="Nombre del participante"
            value={value.recipientName}
            onChange={(e) => set({ recipientName: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Déjalo en blanco si vas a imprimir varias constancias y escribir el nombre a mano.
          </p>
        </div>
        <Input label="Nombre del curso" value={value.courseName} onChange={(e) => set({ courseName: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Duración" value={value.durationLabel} onChange={(e) => set({ durationLabel: e.target.value })} />
          <Input label="Lugar" value={value.location} onChange={(e) => set({ location: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Fecha" type="date" value={value.date} onChange={(e) => set({ date: e.target.value })} />
          <Input label="Folio" value={value.folio} onChange={(e) => set({ folio: e.target.value })} />
        </div>
        <Textarea
          label="Estándar / nota al pie (opcional)"
          value={value.standard}
          className="min-h-[50px]"
          onChange={(e) => set({ standard: e.target.value })}
        />
      </Section>

      <Section title="Firma">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre de quien firma" value={value.issuerName} onChange={(e) => set({ issuerName: e.target.value })} />
          <Input label="Cargo" value={value.issuerRole} onChange={(e) => set({ issuerRole: e.target.value })} />
        </div>
      </Section>
    </div>
  );
}
