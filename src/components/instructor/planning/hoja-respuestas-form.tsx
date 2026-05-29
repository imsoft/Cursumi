"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type HojaRespuestasData,
  type PreguntaRespuesta,
  emptyPreguntaRespuesta,
  emptyTemaRespuestas,
} from "@/lib/planning/hoja-respuestas";
import { opcionLetra } from "@/lib/planning/evaluacion-quiz";

type Props = {
  value: HojaRespuestasData;
  onChange: (next: HojaRespuestasData) => void;
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

export function HojaRespuestasForm({ value, onChange }: Props) {
  const set = (patch: Partial<HojaRespuestasData>) => onChange({ ...value, ...patch });

  const updateTema = (id: string, patch: Partial<TemaPatch>) =>
    set({ temas: value.temas.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const addTema = () => set({ temas: [...value.temas, emptyTemaRespuestas(value.temas.length + 1)] });
  const removeTema = (id: string) => {
    const next = value.temas.filter((t) => t.id !== id);
    set({ temas: next.length > 0 ? next : [emptyTemaRespuestas(1)] });
  };

  const updatePregunta = (tid: string, pid: string, patch: Partial<PreguntaRespuesta>) => {
    const tema = value.temas.find((t) => t.id === tid);
    if (!tema) return;
    updateTema(tid, { preguntas: tema.preguntas.map((p) => (p.id === pid ? { ...p, ...patch } : p)) });
  };
  const addPregunta = (tid: string) => {
    const tema = value.temas.find((t) => t.id === tid);
    if (!tema) return;
    updateTema(tid, { preguntas: [...tema.preguntas, emptyPreguntaRespuesta()] });
  };
  const removePregunta = (tid: string, pid: string) => {
    const tema = value.temas.find((t) => t.id === tid);
    if (!tema) return;
    const next = tema.preguntas.filter((p) => p.id !== pid);
    updateTema(tid, { preguntas: next.length > 0 ? next : [emptyPreguntaRespuesta()] });
  };

  const updateOpcion = (tid: string, pid: string, idx: number, texto: string) => {
    const tema = value.temas.find((t) => t.id === tid);
    const pregunta = tema?.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    updatePregunta(tid, pid, { opciones: pregunta.opciones.map((o, i) => (i === idx ? texto : o)) });
  };
  const addOpcion = (tid: string, pid: string) => {
    const tema = value.temas.find((t) => t.id === tid);
    const pregunta = tema?.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    updatePregunta(tid, pid, { opciones: [...pregunta.opciones, ""] });
  };
  const removeOpcion = (tid: string, pid: string, idx: number) => {
    const tema = value.temas.find((t) => t.id === tid);
    const pregunta = tema?.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    const opciones = pregunta.opciones.filter((_, i) => i !== idx);
    let correctaIndex = pregunta.correctaIndex;
    if (correctaIndex !== null) {
      if (correctaIndex === idx) correctaIndex = null;
      else if (correctaIndex > idx) correctaIndex -= 1;
    }
    updatePregunta(tid, pid, { opciones: opciones.length > 0 ? opciones : [""], correctaIndex });
  };
  const marcarCorrecta = (tid: string, pid: string, idx: number) => {
    const tema = value.temas.find((t) => t.id === tid);
    const pregunta = tema?.preguntas.find((p) => p.id === pid);
    if (!pregunta) return;
    updatePregunta(tid, pid, { correctaIndex: pregunta.correctaIndex === idx ? null : idx });
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
        <Input label="Título del documento" value={value.tituloDocumento} onChange={(e) => set({ tituloDocumento: e.target.value })} />
      </Section>

      <p className="px-1 text-xs text-muted-foreground">
        Marca la opción correcta con el botón <Check className="inline h-3 w-3" /> de cada pregunta. Esa respuesta se resaltará en el PDF.
      </p>

      {value.temas.map((tema) => (
        <Section key={tema.id} title={tema.titulo || "Tema"}>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Título del tema" value={tema.titulo} placeholder="Ej. Tema 1: Introducción" onChange={(e) => updateTema(tema.id, { titulo: e.target.value })} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => removeTema(tema.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            label="Instrucciones del tema"
            value={tema.instrucciones}
            className="min-h-[60px]"
            onChange={(e) => updateTema(tema.id, { instrucciones: e.target.value })}
          />

          <div className="space-y-4">
            {tema.preguntas.map((p, idx) => (
              <div key={p.id} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Pregunta {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removePregunta(tema.id, p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  label="Enunciado"
                  value={p.enunciado}
                  placeholder="Escribe la pregunta"
                  className="min-h-[60px]"
                  onChange={(e) => updatePregunta(tema.id, p.id, { enunciado: e.target.value })}
                />
                <div className="mt-3 space-y-2">
                  {p.opciones.map((o, i) => {
                    const correcta = p.correctaIndex === i;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          title={correcta ? "Respuesta correcta" : "Marcar como correcta"}
                          onClick={() => marcarCorrecta(tema.id, p.id, i)}
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                            correcta ? "border-green-500 bg-green-500 text-white" : "border-border text-muted-foreground hover:border-green-500",
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <span className="w-5 shrink-0 text-sm font-semibold text-primary">{opcionLetra(i)}.</span>
                        <div className="flex-1">
                          <Input value={o} placeholder={`Opción ${opcionLetra(i)}`} onChange={(e) => updateOpcion(tema.id, p.id, i, e.target.value)} />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeOpcion(tema.id, p.id, i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addOpcion(tema.id, p.id)}>
                    <Plus className="h-4 w-4" /> Agregar opción
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addPregunta(tema.id)}>
              <Plus className="h-4 w-4" /> Agregar pregunta
            </Button>
          </div>
        </Section>
      ))}

      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addTema}>
        <Plus className="h-4 w-4" /> Agregar tema
      </Button>
    </div>
  );
}

type TemaPatch = {
  titulo: string;
  instrucciones: string;
  preguntas: PreguntaRespuesta[];
};
