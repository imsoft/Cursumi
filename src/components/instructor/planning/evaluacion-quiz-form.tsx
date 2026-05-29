"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { type EvaluacionQuizData, emptyPregunta, opcionLetra } from "@/lib/planning/evaluacion-quiz";

type Props = {
  value: EvaluacionQuizData;
  onChange: (next: EvaluacionQuizData) => void;
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

export function EvaluacionQuizForm({ value, onChange }: Props) {
  const set = (patch: Partial<EvaluacionQuizData>) => onChange({ ...value, ...patch });

  const updatePregunta = (id: string, patch: Partial<{ enunciado: string; opciones: string[] }>) =>
    set({ preguntas: value.preguntas.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

  const addPregunta = () => set({ preguntas: [...value.preguntas, emptyPregunta()] });

  const removePregunta = (id: string) => {
    const rows = value.preguntas.filter((p) => p.id !== id);
    set({ preguntas: rows.length > 0 ? rows : [emptyPregunta()] });
  };

  const updateOpcion = (pid: string, idx: number, texto: string) => {
    const pregunta = value.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    const opciones = pregunta.opciones.map((o, i) => (i === idx ? texto : o));
    updatePregunta(pid, { opciones });
  };

  const addOpcion = (pid: string) => {
    const pregunta = value.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    updatePregunta(pid, { opciones: [...pregunta.opciones, ""] });
  };

  const removeOpcion = (pid: string, idx: number) => {
    const pregunta = value.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    const opciones = pregunta.opciones.filter((_, i) => i !== idx);
    updatePregunta(pid, { opciones: opciones.length > 0 ? opciones : [""] });
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

      <Section title="Cuestionario">
        <Input label="Título del cuestionario" value={value.tituloCuestionario} onChange={(e) => set({ tituloCuestionario: e.target.value })} />

        <div className="space-y-4">
          {value.preguntas.map((p, idx) => (
            <div key={p.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Pregunta {idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removePregunta(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                label="Enunciado"
                value={p.enunciado}
                placeholder="Escribe la pregunta"
                className="min-h-[60px]"
                onChange={(e) => updatePregunta(p.id, { enunciado: e.target.value })}
              />
              <div className="mt-3 space-y-2">
                {p.opciones.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm font-semibold text-primary">{opcionLetra(i)}.</span>
                    <div className="flex-1">
                      <Input value={o} placeholder={`Opción ${opcionLetra(i)}`} onChange={(e) => updateOpcion(p.id, i, e.target.value)} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeOpcion(p.id, i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addOpcion(p.id)}>
                  <Plus className="h-4 w-4" /> Agregar opción
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addPregunta}>
            <Plus className="h-4 w-4" /> Agregar pregunta
          </Button>
        </div>
      </Section>
    </div>
  );
}
