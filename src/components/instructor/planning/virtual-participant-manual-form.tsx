"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import {
  type VirtualParticipantManualData,
  type VirtualManualSection,
  emptyVirtualManualSection,
} from "@/lib/planning/virtual-participant-manual";

type Props = {
  value: VirtualParticipantManualData;
  onChange: (next: VirtualParticipantManualData) => void;
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function VirtualParticipantManualForm({ value, onChange }: Props) {
  const set = <K extends keyof VirtualParticipantManualData>(key: K, val: VirtualParticipantManualData[K]) =>
    onChange({ ...value, [key]: val });

  const updateSection = (id: string, patch: Partial<VirtualManualSection>) =>
    onChange({ ...value, sections: value.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const removeSection = (id: string) =>
    onChange({ ...value, sections: value.sections.filter((s) => s.id !== id) });

  const addSection = (level: 1 | 2) =>
    onChange({ ...value, sections: [...value.sections, emptyVirtualManualSection(level)] });

  const updateBib = (i: number, text: string) => {
    const next = [...value.bibliography];
    next[i] = text;
    onChange({ ...value, bibliography: next });
  };

  const removeBib = (i: number) =>
    onChange({ ...value, bibliography: value.bibliography.filter((_, idx) => idx !== i) });

  const addBib = () =>
    onChange({ ...value, bibliography: [...value.bibliography, ""] });

  return (
    <div className="space-y-6">
      {/* ── Portada ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Portada</h2>
        <Field label="Nombre del curso">
          <Input value={value.courseName} onChange={(e) => set("courseName", e.target.value)} />
        </Field>
        <Field label="Estándar de referencia" hint="Ej. EC0754 Implementación de la educación financiera…">
          <Textarea value={value.referenceStandard} onChange={(e) => set("referenceStandard", e.target.value)} rows={2} className="resize-none" />
        </Field>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={value.showTableOfContents}
            onChange={(e) => set("showTableOfContents", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Mostrar tabla de contenido
        </label>
      </section>

      {/* ── Secciones ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Secciones del manual</h2>
        <p className="text-xs text-muted-foreground">Nivel 1 = capítulo principal · Nivel 2 = subsección indentada</p>

        <div className="space-y-3">
          {value.sections.map((s, i) => (
            <div
              key={s.id}
              className={`rounded-xl border border-border bg-background p-4 space-y-3 ${s.level === 2 ? "ml-6" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${s.level === 1 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    N{s.level}
                  </span>
                  <span className="text-xs text-muted-foreground">Sección {i + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <select
                    value={s.level}
                    onChange={(e) => updateSection(s.id, { level: parseInt(e.target.value) as 1 | 2 })}
                    className="h-7 rounded border border-border bg-background px-2 text-xs text-foreground"
                  >
                    <option value={1}>Nivel 1</option>
                    <option value={2}>Nivel 2</option>
                  </select>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSection(s.id)}
                    disabled={value.sections.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Field label="Título">
                <Input value={s.title} onChange={(e) => updateSection(s.id, { title: e.target.value })} className="h-8 text-sm" />
              </Field>
              <Field label="Contenido">
                <Textarea value={s.body} onChange={(e) => updateSection(s.id, { body: e.target.value })} rows={5} className="resize-y text-sm" />
              </Field>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => addSection(1)}>
            <PlusCircle className="h-4 w-4" /> Capítulo (N1)
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => addSection(2)}>
            <PlusCircle className="h-4 w-4" /> Subsección (N2)
          </Button>
        </div>
      </section>

      {/* ── Bibliografía ── */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Bibliografía</h2>
        <div className="space-y-2">
          {value.bibliography.map((bib, i) => (
            <div key={i} className="flex items-start gap-2">
              <Textarea
                value={bib}
                onChange={(e) => updateBib(i, e.target.value)}
                rows={2}
                className="flex-1 resize-none text-sm"
              />
              <Button
                variant="ghost" size="icon" className="h-9 w-9 shrink-0 mt-0.5 text-muted-foreground hover:text-destructive"
                onClick={() => removeBib(i)}
                disabled={value.bibliography.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={addBib}>
          <PlusCircle className="h-4 w-4" /> Agregar referencia
        </Button>
      </section>
    </div>
  );
}
