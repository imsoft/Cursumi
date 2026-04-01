"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QueAprendisteFormProps {
  courseId: string;
  initialContent: string;
  courseSlug: string | null;
}

export function QueAprendisteForm({
  courseId,
  initialContent,
  courseSlug,
}: QueAprendisteFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/learning-reflections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = courseSlug ? `/courses/${courseSlug}` : "/dashboard/explore";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        maxLength={2000}
        placeholder="Escribe con tus palabras qué te llevaste del curso o del taller…"
        className="min-h-[180px] resize-y text-base"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{content.length}/2000</span>
        {saved && <span className="text-primary">Guardado.</span>}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || content.trim().length < 10}>
          {saving ? "Guardando…" : initialContent ? "Actualizar" : "Publicar en la ficha del curso"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={publicUrl}>Ver ficha pública del curso</a>
        </Button>
      </div>
    </form>
  );
}
