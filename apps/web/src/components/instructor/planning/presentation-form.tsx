"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ChevronUp, ChevronDown } from "lucide-react";
import { SlideThumb } from "./presentation-document";
import {
  type PresentationData,
  type Slide,
  type SlideKind,
  SLIDE_KIND_LABEL,
  emptySlide,
} from "@/lib/planning/presentation";

type Props = {
  value: PresentationData;
  onChange: (next: PresentationData) => void;
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

const KIND_ORDER: SlideKind[] = ["cover", "section", "content", "closing"];

function SlideCard({
  slide,
  index,
  total,
  presenter,
  onUpdate,
  onRemove,
  onMove,
}: {
  slide: Slide;
  index: number;
  total: number;
  presenter: string;
  onUpdate: (patch: Partial<Slide>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const updateBullet = (i: number, text: string) => {
    const next = [...slide.bullets];
    next[i] = text;
    onUpdate({ bullets: next });
  };
  const removeBullet = (i: number) => onUpdate({ bullets: slide.bullets.filter((_, idx) => idx !== i) });
  const addBullet = () => onUpdate({ bullets: [...slide.bullets, ""] });

  // Etiquetas contextuales según el tipo de slide
  const headingLabel = slide.kind === "cover" ? "Título del curso" : slide.kind === "section" ? "Título del tema" : slide.kind === "closing" ? "Mensaje de cierre" : "Título de la diapositiva";
  const subLabel = slide.kind === "cover" ? "Subtítulo" : slide.kind === "section" ? "Descripción del tema" : slide.kind === "closing" ? "Subtítulo" : "Subtítulo (opcional)";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex gap-4">
        {/* Preview */}
        <SlideThumb slide={slide} presenter={presenter} width={260} />

        {/* Controles */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <select
                value={slide.kind}
                onChange={(e) => onUpdate({ kind: e.target.value as SlideKind })}
                className="h-8 rounded border border-border bg-background px-2 text-xs font-medium text-foreground"
              >
                {KIND_ORDER.map((k) => (
                  <option key={k} value={k}>{SLIDE_KIND_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(-1)} disabled={index === 0}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(1)} disabled={index === total - 1}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onRemove} disabled={total <= 1}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Field label={headingLabel}>
            <Input value={slide.heading} onChange={(e) => onUpdate({ heading: e.target.value })} className="h-8 text-sm" />
          </Field>

          <Field label={subLabel}>
            <Input value={slide.sub} onChange={(e) => onUpdate({ sub: e.target.value })} className="h-8 text-sm" />
          </Field>

          {slide.kind === "content" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Puntos</Label>
              {slide.bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={b} onChange={(e) => updateBullet(i, e.target.value)} className="h-8 text-sm flex-1" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeBullet(i)} disabled={slide.bullets.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={addBullet}>
                <PlusCircle className="h-3.5 w-3.5" /> Agregar punto
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PresentationForm({ value, onChange }: Props) {
  const set = <K extends keyof PresentationData>(key: K, val: PresentationData[K]) =>
    onChange({ ...value, [key]: val });

  const updateSlide = (id: string, patch: Partial<Slide>) =>
    onChange({ ...value, slides: value.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const removeSlide = (id: string) =>
    onChange({ ...value, slides: value.slides.filter((s) => s.id !== id) });

  const addSlide = (kind: SlideKind) =>
    onChange({ ...value, slides: [...value.slides, emptySlide(kind)] });

  const moveSlide = (index: number, dir: -1 | 1) => {
    const next = [...value.slides];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...value, slides: next });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="text-base font-semibold text-foreground">Datos de la presentación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del curso">
            <Input value={value.courseName} onChange={(e) => set("courseName", e.target.value)} />
          </Field>
          <Field label="Presentador (instructor)">
            <Input value={value.presenter} onChange={(e) => set("presenter", e.target.value)} />
          </Field>
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Diapositivas</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          La marca Cursumi se aplica automáticamente. Descarga el PDF 16:9 y ábrelo a pantalla completa para presentar o grabar.
        </p>
        {value.slides.map((slide, i) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={i}
            total={value.slides.length}
            presenter={value.presenter}
            onUpdate={(patch) => updateSlide(slide.id, patch)}
            onRemove={() => removeSlide(slide.id)}
            onMove={(dir) => moveSlide(i, dir)}
          />
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          {KIND_ORDER.map((k) => (
            <Button key={k} variant="outline" size="sm" className="gap-2" onClick={() => addSlide(k)}>
              <PlusCircle className="h-4 w-4" /> {SLIDE_KIND_LABEL[k]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
