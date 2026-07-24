"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InformeFinalData } from "@/lib/planning/informe-final";

type Props = {
  value: InformeFinalData;
  onChange: (next: InformeFinalData) => void;
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

export function InformeFinalForm({ value, onChange }: Props) {
  const set = (patch: Partial<InformeFinalData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Section title="Datos generales">
        <Input label="Nombre del curso" value={value.courseName} onChange={(e) => set({ courseName: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Instructor / facilitador" value={value.instructorName} onChange={(e) => set({ instructorName: e.target.value })} />
          <Input label="Periodo / fechas" value={value.period} onChange={(e) => set({ period: e.target.value })} />
        </div>
        <Input label="Lugar" value={value.location} onChange={(e) => set({ location: e.target.value })} />
      </Section>

      <Section title="Participación">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Inscritos" type="number" min={0} value={value.enrolledCount} onChange={(e) => set({ enrolledCount: e.target.value })} />
          <Input label="Concluyeron" type="number" min={0} value={value.completedCount} onChange={(e) => set({ completedCount: e.target.value })} />
          <Input label="Aprobados" type="number" min={0} value={value.approvedCount} onChange={(e) => set({ approvedCount: e.target.value })} />
        </div>
      </Section>

      <Section title="Desarrollo del curso">
        <Textarea label="Objetivos" value={value.objectivesSummary} className="min-h-20" onChange={(e) => set({ objectivesSummary: e.target.value })} />
        <Textarea label="Desarrollo / metodología" value={value.developmentSummary} className="min-h-20" onChange={(e) => set({ developmentSummary: e.target.value })} />
        <Textarea label="Resultados" value={value.results} className="min-h-20" onChange={(e) => set({ results: e.target.value })} />
        <Textarea label="Observaciones" value={value.observations} className="min-h-20" onChange={(e) => set({ observations: e.target.value })} />
        <Textarea label="Recomendaciones" value={value.recommendations} className="min-h-20" onChange={(e) => set({ recommendations: e.target.value })} />
        <Textarea label="Conclusiones" value={value.conclusions} className="min-h-20" onChange={(e) => set({ conclusions: e.target.value })} />
      </Section>

      <Section title="Cierre">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Elaborado por" value={value.elaboratedBy} onChange={(e) => set({ elaboratedBy: e.target.value })} />
          <Input label="Fecha" type="date" value={value.date} onChange={(e) => set({ date: e.target.value })} />
        </div>
      </Section>
    </div>
  );
}
