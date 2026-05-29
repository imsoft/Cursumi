"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type DescriptiveChartData,
  type ActivityRow,
  type SpecificObjective,
  emptyActivityRow,
  emptyEvaluationCriteria,
  sumDuration,
  sumDurationTotal,
  formatMinutes,
} from "@/lib/planning/descriptive-chart";

type Props = {
  value: DescriptiveChartData;
  onChange: (next: DescriptiveChartData) => void;
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

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return textarea ? (
    <Textarea
      label={label}
      value={value}
      placeholder={placeholder}
      className="min-h-[90px]"
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <Input label={label} value={value} placeholder={placeholder} type={type} onChange={(e) => onChange(e.target.value)} />
  );
}

export function DescriptiveChartForm({ value, onChange }: Props) {
  const set = (patch: Partial<DescriptiveChartData>) => onChange({ ...value, ...patch });

  const setSpecificObjective = (
    key: "cognitiveObjective" | "psychomotorObjective" | "affectiveObjective",
    patch: Partial<SpecificObjective>,
  ) => set({ [key]: { ...value[key], ...patch } } as Partial<DescriptiveChartData>);

  const updateRow = (
    key: "opening" | "development" | "closing",
    id: string,
    patch: Partial<ActivityRow>,
  ) => set({ [key]: value[key].map((r) => (r.id === id ? { ...r, ...patch } : r)) } as Partial<DescriptiveChartData>);

  const addRow = (key: "opening" | "development" | "closing") =>
    set({ [key]: [...value[key], emptyActivityRow()] } as Partial<DescriptiveChartData>);

  const removeRow = (key: "opening" | "development" | "closing", id: string) => {
    const rows = value[key].filter((r) => r.id !== id);
    set({ [key]: rows.length > 0 ? rows : [emptyActivityRow()] } as Partial<DescriptiveChartData>);
  };

  const renderActivityEditor = (
    key: "opening" | "development" | "closing",
    firstColLabel: string,
  ) => (
    <div className="space-y-4">
      {value[key].map((row, idx) => (
        <div key={row.id} className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Fila {idx + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => removeRow(key, row.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={firstColLabel} value={row.stageTopic} textarea onChange={(v) => updateRow(key, row.id, { stageTopic: v })} />
            <Field label="Actividades" value={row.activities} textarea onChange={(v) => updateRow(key, row.id, { activities: v })} />
            <div className="flex w-full flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Duración (minutos)</label>
              <Input
                type="number"
                min={0}
                value={row.durationMin ?? ""}
                placeholder="Ej. 15"
                onChange={(e) =>
                  updateRow(key, row.id, {
                    durationMin: e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
                  })
                }
              />
            </div>
            <Field label="Técnicas grupales / instruccionales" value={row.techniques} onChange={(v) => updateRow(key, row.id, { techniques: v })} />
            <Field label="Material y equipo de apoyo" value={row.materials} textarea onChange={(v) => updateRow(key, row.id, { materials: v })} />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={() => addRow(key)} className="gap-2">
          <Plus className="h-4 w-4" /> Agregar fila
        </Button>
        <span className="text-sm font-medium text-primary">
          Sumatoria: {formatMinutes(sumDuration(value[key]))}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 1. Información general */}
      <Section title="1. Información general">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre del curso-taller" value={value.courseName} onChange={(v) => set({ courseName: v })} />
          <Field label="Nombre del facilitador / instructor" value={value.instructorName} onChange={(v) => set({ instructorName: v })} />
          <Field label="Lugar de instrucción" value={value.location} onChange={(v) => set({ location: v })} />
          <Field label="Duración" value={value.duration} placeholder="Ej. 3 horas" onChange={(v) => set({ duration: v })} />
          <Field label="Fecha(s)" value={value.dates} placeholder="Ej. 28 de febrero 2025" onChange={(v) => set({ dates: v })} />
          <Field label="Número de participantes" value={value.participantCount} type="number" onChange={(v) => set({ participantCount: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Perfil: psicográficas" value={value.psychographicProfile} textarea onChange={(v) => set({ psychographicProfile: v })} />
          <Field label="Perfil: conocimientos" value={value.knowledgeProfile} textarea onChange={(v) => set({ knowledgeProfile: v })} />
          <Field label="Perfil: habilidades" value={value.skillsProfile} textarea onChange={(v) => set({ skillsProfile: v })} />
        </div>
        <Field label="Propósito / beneficio del curso" value={value.purpose} textarea onChange={(v) => set({ purpose: v })} />
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Objetivo general</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Sujeto" value={value.generalObjective.subject} onChange={(v) => set({ generalObjective: { ...value.generalObjective, subject: v } })} />
            <Field label="Acción o comportamiento" value={value.generalObjective.action} textarea onChange={(v) => set({ generalObjective: { ...value.generalObjective, action: v } })} />
            <Field label="Condición de operación" value={value.generalObjective.condition} textarea onChange={(v) => set({ generalObjective: { ...value.generalObjective, condition: v } })} />
          </div>
        </div>
      </Section>

      {/* 2. Objetivos particulares */}
      <Section title="2. Objetivos particulares">
        {([
          { key: "cognitiveObjective", label: "Cognitivo" },
          { key: "psychomotorObjective", label: "Psicomotor" },
          { key: "affectiveObjective", label: "Afectivo" },
        ] as const).map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Sujeto" value={value[key].subject} onChange={(v) => setSpecificObjective(key, { subject: v })} />
              <Field label="Acción o comportamiento" value={value[key].action} textarea onChange={(v) => setSpecificObjective(key, { action: v })} />
              <Field label="Condición de operación" value={value[key].condition} textarea onChange={(v) => setSpecificObjective(key, { condition: v })} />
              <Field label="Temas (uno por línea)" value={value[key].topics} textarea onChange={(v) => setSpecificObjective(key, { topics: v })} />
            </div>
          </div>
        ))}
      </Section>

      {/* 3. Requerimientos */}
      <Section title="3. Requerimientos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Instalaciones, mobiliario y distribución" value={value.facilitiesRequirement} textarea onChange={(v) => set({ facilitiesRequirement: v })} />
          <Field label="Equipo de apoyo y su distribución" value={value.equipmentRequirement} textarea onChange={(v) => set({ equipmentRequirement: v })} />
          <Field label="Materiales de apoyo" value={value.materialsRequirement} textarea onChange={(v) => set({ materialsRequirement: v })} />
          <Field label="Requerimientos humanos" value={value.humanResourcesRequirement} textarea onChange={(v) => set({ humanResourcesRequirement: v })} />
          <Field label="Salud / seguridad / protección civil" value={value.safetyRequirement} textarea onChange={(v) => set({ safetyRequirement: v })} />
        </div>
      </Section>

      {/* 4. Evaluación */}
      <Section title="4. Evaluación">
        <Field label="Descripción de las formas, momentos y criterios" value={value.assessmentDescription} textarea onChange={(v) => set({ assessmentDescription: v })} />
        <div className="space-y-3">
          {value.assessmentCriteria.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Criterio</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => set({ assessmentCriteria: value.assessmentCriteria.filter((x) => x.id !== c.id) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Aspecto" value={c.aspect} onChange={(v) => set({ assessmentCriteria: value.assessmentCriteria.map((x) => x.id === c.id ? { ...x, aspect: v } : x) })} />
                <Field label="Porcentaje" value={c.percentage} onChange={(v) => set({ assessmentCriteria: value.assessmentCriteria.map((x) => x.id === c.id ? { ...x, percentage: v } : x) })} />
                <Field label="Instrumento" value={c.instrument} onChange={(v) => set({ assessmentCriteria: value.assessmentCriteria.map((x) => x.id === c.id ? { ...x, instrument: v } : x) })} />
                <Field label="Momento" value={c.moment} onChange={(v) => set({ assessmentCriteria: value.assessmentCriteria.map((x) => x.id === c.id ? { ...x, moment: v } : x) })} />
                <Field label="Tipo" value={c.type} onChange={(v) => set({ assessmentCriteria: value.assessmentCriteria.map((x) => x.id === c.id ? { ...x, type: v } : x) })} />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => set({ assessmentCriteria: [...value.assessmentCriteria, emptyEvaluationCriteria("", "")] })}
          >
            <Plus className="h-4 w-4" /> Agregar criterio
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Comprobación de existencia y funcionamiento de recursos</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etapa" value={value.resourceVerification.stage} textarea onChange={(v) => set({ resourceVerification: { ...value.resourceVerification, stage: v } })} />
            <Field label="Actividades" value={value.resourceVerification.activities} textarea onChange={(v) => set({ resourceVerification: { ...value.resourceVerification, activities: v } })} />
            <Field label="Duración" value={value.resourceVerification.duration} onChange={(v) => set({ resourceVerification: { ...value.resourceVerification, duration: v } })} />
            <Field label="Técnicas" value={value.resourceVerification.techniques} onChange={(v) => set({ resourceVerification: { ...value.resourceVerification, techniques: v } })} />
            <Field label="Material y equipo de apoyo" value={value.resourceVerification.materials} textarea onChange={(v) => set({ resourceVerification: { ...value.resourceVerification, materials: v } })} />
          </div>
        </div>
      </Section>

      {/* 5. Apertura */}
      <Section title="5. Apertura o encuadre">{renderActivityEditor("opening", "Etapa del encuadre")}</Section>

      {/* 6. Desarrollo */}
      <Section title="6. Desarrollo">{renderActivityEditor("development", "Temas / subtemas")}</Section>

      {/* 7. Cierre */}
      <Section title="7. Cierre">{renderActivityEditor("closing", "Temas / subtemas")}</Section>

      {/* Total */}
      <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 px-5 py-4 text-center text-base font-semibold text-primary">
        Sumatoria de tiempo total: {formatMinutes(sumDurationTotal(value))}
      </div>
    </div>
  );
}
