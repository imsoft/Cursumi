"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import {
  type CourseReviewReportData,
  type DesignObservation,
  emptyDesignObservation,
} from "@/lib/planning/course-review-report";

type Props = {
  value: CourseReviewReportData;
  onChange: (next: CourseReviewReportData) => void;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function CourseReviewReportForm({ value, onChange }: Props) {
  const set = <K extends keyof CourseReviewReportData>(key: K, val: CourseReviewReportData[K]) =>
    onChange({ ...value, [key]: val });

  const updateObs = (id: string, patch: Partial<DesignObservation>) =>
    onChange({ ...value, designObservations: value.designObservations.map((o) => (o.id === id ? { ...o, ...patch } : o)) });

  const removeObs = (id: string) =>
    onChange({ ...value, designObservations: value.designObservations.filter((o) => o.id !== id) });

  const addObs = () =>
    onChange({ ...value, designObservations: [...value.designObservations, emptyDesignObservation()] });

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <Section title="Información general">
        <Field label="Nombre del curso">
          <Input value={value.courseName} onChange={(e) => set("courseName", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del desarrollador">
            <Input value={value.developerName} onChange={(e) => set("developerName", e.target.value)} />
          </Field>
          <Field label="Fecha de revisión del curso">
            <Input type="date" value={value.reviewDate} onChange={(e) => set("reviewDate", e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* ── Observaciones de diseño ── */}
      <Section title="Observaciones de diseño">
        <div className="space-y-4">
          {value.designObservations.map((obs, i) => (
            <div key={obs.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Observación {i + 1}</span>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeObs(obs.id)}
                  disabled={value.designObservations.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Field label="Observación de diseño">
                <Textarea value={obs.observation} onChange={(e) => updateObs(obs.id, { observation: e.target.value })} rows={3} className="resize-none text-sm" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Unidad o tema donde se presentó">
                  <Textarea value={obs.unit} onChange={(e) => updateObs(obs.id, { unit: e.target.value })} rows={2} className="resize-none text-sm" />
                </Field>
                <Field label="Propuesta de modificación">
                  <Textarea value={obs.proposal} onChange={(e) => updateObs(obs.id, { proposal: e.target.value })} rows={2} className="resize-none text-sm" />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={addObs}>
          <PlusCircle className="h-4 w-4" /> Agregar observación
        </Button>
      </Section>

      {/* ── Observaciones de contenido y plataforma ── */}
      <Section title="Observaciones del contenido">
        <Textarea value={value.contentObservations} onChange={(e) => set("contentObservations", e.target.value)} rows={4} className="resize-y" />
      </Section>

      <Section title="Observaciones de la funcionalidad de la plataforma">
        <Textarea value={value.platformObservations} onChange={(e) => set("platformObservations", e.target.value)} rows={4} className="resize-y" />
      </Section>
    </div>
  );
}
