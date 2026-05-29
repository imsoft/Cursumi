"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  type EvaluacionCalidadData,
  emptyPreguntaCalidad,
  emptySeccionCalidad,
} from "@/lib/planning/evaluacion-calidad";
import { opcionLetra } from "@/lib/planning/evaluacion-quiz";

type Props = {
  value: EvaluacionCalidadData;
  onChange: (next: EvaluacionCalidadData) => void;
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

export function EvaluacionCalidadForm({ value, onChange }: Props) {
  const set = (patch: Partial<EvaluacionCalidadData>) => onChange({ ...value, ...patch });

  // Escala (opciones compartidas)
  const updateEscala = (idx: number, texto: string) =>
    set({ escala: value.escala.map((o, i) => (i === idx ? texto : o)) });
  const addEscala = () => set({ escala: [...value.escala, ""] });
  const removeEscala = (idx: number) => {
    const next = value.escala.filter((_, i) => i !== idx);
    set({ escala: next.length > 0 ? next : [""] });
  };

  // Secciones
  const updateSeccion = (id: string, patch: Partial<{ titulo: string; preguntas: EvaluacionCalidadData["secciones"][number]["preguntas"] }>) =>
    set({ secciones: value.secciones.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addSeccion = () => set({ secciones: [...value.secciones, emptySeccionCalidad()] });
  const removeSeccion = (id: string) => {
    const next = value.secciones.filter((s) => s.id !== id);
    set({ secciones: next.length > 0 ? next : [emptySeccionCalidad()] });
  };

  const updatePregunta = (sid: string, pid: string, enunciado: string) => {
    const seccion = value.secciones.find((s) => s.id === sid);
    if (!seccion) return;
    updateSeccion(sid, { preguntas: seccion.preguntas.map((p) => (p.id === pid ? { ...p, enunciado } : p)) });
  };
  const addPregunta = (sid: string) => {
    const seccion = value.secciones.find((s) => s.id === sid);
    if (!seccion) return;
    updateSeccion(sid, { preguntas: [...seccion.preguntas, emptyPreguntaCalidad()] });
  };
  const removePregunta = (sid: string, pid: string) => {
    const seccion = value.secciones.find((s) => s.id === sid);
    if (!seccion) return;
    const next = seccion.preguntas.filter((p) => p.id !== pid);
    updateSeccion(sid, { preguntas: next.length > 0 ? next : [emptyPreguntaCalidad()] });
  };

  return (
    <div className="space-y-4">
      <Section title="Portada y datos generales">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nombre del curso / sesión" value={value.nombreCurso} onChange={(e) => set({ nombreCurso: e.target.value })} />
          <Input label="Nombre del facilitador / instructor" value={value.nombreInstructor} onChange={(e) => set({ nombreInstructor: e.target.value })} />
          <Input label="Lugar de impartición" value={value.lugar} onChange={(e) => set({ lugar: e.target.value })} />
          <Input label="Fecha de impartición" value={value.fecha} placeholder="Ej. 8 de enero de 2025" onChange={(e) => set({ fecha: e.target.value })} />
          <Input label="Horario" value={value.horario} placeholder="Ej. 4:00 pm" onChange={(e) => set({ horario: e.target.value })} />
          <Input label="Duración" value={value.duracion} placeholder="Ej. 221 minutos" onChange={(e) => set({ duracion: e.target.value })} />
        </div>
      </Section>

      <Section title="Encabezado del cuestionario">
        <Input label="Título del cuestionario" value={value.tituloCuestionario} onChange={(e) => set({ tituloCuestionario: e.target.value })} />
        <Textarea
          label="Instrucciones"
          value={value.instrucciones}
          className="min-h-[80px]"
          onChange={(e) => set({ instrucciones: e.target.value })}
        />
      </Section>

      <Section title="Escala de respuesta (común a todas las preguntas)">
        <div className="space-y-2">
          {value.escala.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-sm font-semibold text-primary">{opcionLetra(i)}.</span>
              <div className="flex-1">
                <Input value={o} placeholder={`Opción ${opcionLetra(i)}`} onChange={(e) => updateEscala(i, e.target.value)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeEscala(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addEscala}>
            <Plus className="h-4 w-4" /> Agregar opción
          </Button>
        </div>
      </Section>

      <Section title="Secciones y preguntas">
        <div className="space-y-4">
          {value.secciones.map((seccion) => (
            <div key={seccion.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-end gap-2">
                <div className="flex-1">
                  <Input label="Sección" value={seccion.titulo} placeholder="Ej. Instructor" onChange={(e) => updateSeccion(seccion.id, { titulo: e.target.value })} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeSeccion(seccion.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {seccion.preguntas.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">{idx + 1}.</span>
                    <div className="flex-1">
                      <Input value={p.enunciado} placeholder="Escribe la pregunta" onChange={(e) => updatePregunta(seccion.id, p.id, e.target.value)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removePregunta(seccion.id, p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addPregunta(seccion.id)}>
                  <Plus className="h-4 w-4" /> Agregar pregunta
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addSeccion}>
            <Plus className="h-4 w-4" /> Agregar sección
          </Button>
        </div>
      </Section>
    </div>
  );
}
