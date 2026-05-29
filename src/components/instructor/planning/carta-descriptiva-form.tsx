"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type CartaDescriptivaData,
  type ActividadFila,
  type ObjetivoParticular,
  emptyActividadFila,
  emptyCriterio,
  sumDuracion,
  sumDuracionTotal,
  formatMinutos,
} from "@/lib/planning/carta-descriptiva";

type Props = {
  value: CartaDescriptivaData;
  onChange: (next: CartaDescriptivaData) => void;
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

export function CartaDescriptivaForm({ value, onChange }: Props) {
  const set = (patch: Partial<CartaDescriptivaData>) => onChange({ ...value, ...patch });

  const setObjetivoParticular = (
    key: "objCognitivo" | "objPsicomotor" | "objAfectivo",
    patch: Partial<ObjetivoParticular>,
  ) => set({ [key]: { ...value[key], ...patch } } as Partial<CartaDescriptivaData>);

  const updateRow = (
    key: "apertura" | "desarrollo" | "cierre",
    id: string,
    patch: Partial<ActividadFila>,
  ) => set({ [key]: value[key].map((r) => (r.id === id ? { ...r, ...patch } : r)) } as Partial<CartaDescriptivaData>);

  const addRow = (key: "apertura" | "desarrollo" | "cierre") =>
    set({ [key]: [...value[key], emptyActividadFila()] } as Partial<CartaDescriptivaData>);

  const removeRow = (key: "apertura" | "desarrollo" | "cierre", id: string) => {
    const rows = value[key].filter((r) => r.id !== id);
    set({ [key]: rows.length > 0 ? rows : [emptyActividadFila()] } as Partial<CartaDescriptivaData>);
  };

  const renderActivityEditor = (
    key: "apertura" | "desarrollo" | "cierre",
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
            <Field label={firstColLabel} value={row.temaEtapa} textarea onChange={(v) => updateRow(key, row.id, { temaEtapa: v })} />
            <Field label="Actividades" value={row.actividades} textarea onChange={(v) => updateRow(key, row.id, { actividades: v })} />
            <div className="flex w-full flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Duración (minutos)</label>
              <Input
                type="number"
                min={0}
                value={row.duracionMin ?? ""}
                placeholder="Ej. 15"
                onChange={(e) =>
                  updateRow(key, row.id, {
                    duracionMin: e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
                  })
                }
              />
            </div>
            <Field label="Técnicas grupales / instruccionales" value={row.tecnicas} onChange={(v) => updateRow(key, row.id, { tecnicas: v })} />
            <Field label="Material y equipo de apoyo" value={row.material} textarea onChange={(v) => updateRow(key, row.id, { material: v })} />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={() => addRow(key)} className="gap-2">
          <Plus className="h-4 w-4" /> Agregar fila
        </Button>
        <span className="text-sm font-medium text-primary">
          Sumatoria: {formatMinutos(sumDuracion(value[key]))}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 1. Información general */}
      <Section title="1. Información general">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre del curso-taller" value={value.nombreCurso} onChange={(v) => set({ nombreCurso: v })} />
          <Field label="Nombre del facilitador / instructor" value={value.nombreInstructor} onChange={(v) => set({ nombreInstructor: v })} />
          <Field label="Lugar de instrucción" value={value.lugar} onChange={(v) => set({ lugar: v })} />
          <Field label="Duración" value={value.duracion} placeholder="Ej. 3 horas" onChange={(v) => set({ duracion: v })} />
          <Field label="Fecha(s)" value={value.fechas} placeholder="Ej. 28 de febrero 2025" onChange={(v) => set({ fechas: v })} />
          <Field label="Número de participantes" value={value.numParticipantes} type="number" onChange={(v) => set({ numParticipantes: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Perfil: psicográficas" value={value.perfilPsicograficas} textarea onChange={(v) => set({ perfilPsicograficas: v })} />
          <Field label="Perfil: conocimientos" value={value.perfilConocimientos} textarea onChange={(v) => set({ perfilConocimientos: v })} />
          <Field label="Perfil: habilidades" value={value.perfilHabilidades} textarea onChange={(v) => set({ perfilHabilidades: v })} />
        </div>
        <Field label="Propósito / beneficio del curso" value={value.proposito} textarea onChange={(v) => set({ proposito: v })} />
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Objetivo general</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Sujeto" value={value.objetivoGeneral.sujeto} onChange={(v) => set({ objetivoGeneral: { ...value.objetivoGeneral, sujeto: v } })} />
            <Field label="Acción o comportamiento" value={value.objetivoGeneral.accion} textarea onChange={(v) => set({ objetivoGeneral: { ...value.objetivoGeneral, accion: v } })} />
            <Field label="Condición de operación" value={value.objetivoGeneral.condicion} textarea onChange={(v) => set({ objetivoGeneral: { ...value.objetivoGeneral, condicion: v } })} />
          </div>
        </div>
      </Section>

      {/* 2. Objetivos particulares */}
      <Section title="2. Objetivos particulares">
        {([
          { key: "objCognitivo", label: "Cognitivo" },
          { key: "objPsicomotor", label: "Psicomotor" },
          { key: "objAfectivo", label: "Afectivo" },
        ] as const).map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Sujeto" value={value[key].sujeto} onChange={(v) => setObjetivoParticular(key, { sujeto: v })} />
              <Field label="Acción o comportamiento" value={value[key].accion} textarea onChange={(v) => setObjetivoParticular(key, { accion: v })} />
              <Field label="Condición de operación" value={value[key].condicion} textarea onChange={(v) => setObjetivoParticular(key, { condicion: v })} />
              <Field label="Temas (uno por línea)" value={value[key].temas} textarea onChange={(v) => setObjetivoParticular(key, { temas: v })} />
            </div>
          </div>
        ))}
      </Section>

      {/* 3. Requerimientos */}
      <Section title="3. Requerimientos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Instalaciones, mobiliario y distribución" value={value.reqInstalaciones} textarea onChange={(v) => set({ reqInstalaciones: v })} />
          <Field label="Equipo de apoyo y su distribución" value={value.reqEquipo} textarea onChange={(v) => set({ reqEquipo: v })} />
          <Field label="Materiales de apoyo" value={value.reqMateriales} textarea onChange={(v) => set({ reqMateriales: v })} />
          <Field label="Requerimientos humanos" value={value.reqHumanos} textarea onChange={(v) => set({ reqHumanos: v })} />
          <Field label="Salud / seguridad / protección civil" value={value.reqSeguridad} textarea onChange={(v) => set({ reqSeguridad: v })} />
        </div>
      </Section>

      {/* 4. Evaluación */}
      <Section title="4. Evaluación">
        <Field label="Descripción de las formas, momentos y criterios" value={value.evaluacionDescripcion} textarea onChange={(v) => set({ evaluacionDescripcion: v })} />
        <div className="space-y-3">
          {value.evaluacionCriterios.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Criterio</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => set({ evaluacionCriterios: value.evaluacionCriterios.filter((x) => x.id !== c.id) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Aspecto" value={c.aspecto} onChange={(v) => set({ evaluacionCriterios: value.evaluacionCriterios.map((x) => x.id === c.id ? { ...x, aspecto: v } : x) })} />
                <Field label="Porcentaje" value={c.porcentaje} onChange={(v) => set({ evaluacionCriterios: value.evaluacionCriterios.map((x) => x.id === c.id ? { ...x, porcentaje: v } : x) })} />
                <Field label="Instrumento" value={c.instrumento} onChange={(v) => set({ evaluacionCriterios: value.evaluacionCriterios.map((x) => x.id === c.id ? { ...x, instrumento: v } : x) })} />
                <Field label="Momento" value={c.momento} onChange={(v) => set({ evaluacionCriterios: value.evaluacionCriterios.map((x) => x.id === c.id ? { ...x, momento: v } : x) })} />
                <Field label="Tipo" value={c.tipo} onChange={(v) => set({ evaluacionCriterios: value.evaluacionCriterios.map((x) => x.id === c.id ? { ...x, tipo: v } : x) })} />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => set({ evaluacionCriterios: [...value.evaluacionCriterios, emptyCriterio("", "")] })}
          >
            <Plus className="h-4 w-4" /> Agregar criterio
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Comprobación de existencia y funcionamiento de recursos</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etapa" value={value.comprobacionRecursos.etapa} textarea onChange={(v) => set({ comprobacionRecursos: { ...value.comprobacionRecursos, etapa: v } })} />
            <Field label="Actividades" value={value.comprobacionRecursos.actividades} textarea onChange={(v) => set({ comprobacionRecursos: { ...value.comprobacionRecursos, actividades: v } })} />
            <Field label="Duración" value={value.comprobacionRecursos.duracion} onChange={(v) => set({ comprobacionRecursos: { ...value.comprobacionRecursos, duracion: v } })} />
            <Field label="Técnicas" value={value.comprobacionRecursos.tecnicas} onChange={(v) => set({ comprobacionRecursos: { ...value.comprobacionRecursos, tecnicas: v } })} />
            <Field label="Material y equipo de apoyo" value={value.comprobacionRecursos.material} textarea onChange={(v) => set({ comprobacionRecursos: { ...value.comprobacionRecursos, material: v } })} />
          </div>
        </div>
      </Section>

      {/* 5. Apertura */}
      <Section title="5. Apertura o encuadre">{renderActivityEditor("apertura", "Etapa del encuadre")}</Section>

      {/* 6. Desarrollo */}
      <Section title="6. Desarrollo">{renderActivityEditor("desarrollo", "Temas / subtemas")}</Section>

      {/* 7. Cierre */}
      <Section title="7. Cierre">{renderActivityEditor("cierre", "Temas / subtemas")}</Section>

      {/* Total */}
      <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 px-5 py-4 text-center text-base font-semibold text-primary">
        Sumatoria de tiempo total: {formatMinutos(sumDuracionTotal(value))}
      </div>
    </div>
  );
}
