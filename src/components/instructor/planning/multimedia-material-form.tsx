"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import {
  type MultimediaMaterialData,
  type MultimediaVideo,
  emptyVideo,
} from "@/lib/planning/multimedia-material";

type Props = {
  value: MultimediaMaterialData;
  onChange: (next: MultimediaMaterialData) => void;
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

export function MultimediaMaterialForm({ value, onChange }: Props) {
  const set = <K extends keyof MultimediaMaterialData>(key: K, val: MultimediaMaterialData[K]) =>
    onChange({ ...value, [key]: val });

  const updateVideo = (id: string, patch: Partial<MultimediaVideo>) =>
    onChange({ ...value, videos: value.videos.map((v) => (v.id === id ? { ...v, ...patch } : v)) });

  const removeVideo = (id: string) =>
    onChange({ ...value, videos: value.videos.filter((v) => v.id !== id) });

  const addVideo = () =>
    onChange({ ...value, videos: [...value.videos, emptyVideo(value.videos.length)] });

  return (
    <div className="space-y-6">
      {/* ── Portada ── */}
      <Section title="Portada">
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
      </Section>

      {/* ── Presentación ── */}
      <Section title="Presentación">
        <Textarea
          value={value.presentation}
          onChange={(e) => set("presentation", e.target.value)}
          rows={4}
          className="resize-y"
        />
      </Section>

      {/* ── Videos / Evidencias ── */}
      <Section title="Evidencias de video">
        <p className="text-xs text-muted-foreground -mt-2">
          Pega la URL pública de cada captura de pantalla (Cloudinary, Google Drive, etc.).
        </p>
        <div className="space-y-4">
          {value.videos.map((video, i) => (
            <div key={video.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Video {i + 1}</span>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeVideo(video.id)}
                  disabled={value.videos.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Field label="Título">
                <Input value={video.title} onChange={(e) => updateVideo(video.id, { title: e.target.value })} />
              </Field>
              <Field label="URL de la captura de pantalla" hint="Imagen pública (JPG, PNG, WebP)">
                <Input
                  value={video.imageUrl}
                  onChange={(e) => updateVideo(video.id, { imageUrl: e.target.value })}
                  placeholder="https://res.cloudinary.com/…"
                />
              </Field>
              {video.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.imageUrl} alt={video.title} className="w-full object-cover max-h-48" />
                </div>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2 mt-2" onClick={addVideo}>
          <PlusCircle className="h-4 w-4" /> Agregar video
        </Button>
      </Section>
    </div>
  );
}
