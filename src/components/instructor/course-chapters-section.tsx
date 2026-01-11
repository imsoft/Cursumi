"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Chapter = {
  id: string;
  title: string;
  duration: string;
  summary: string;
};

export const CourseChaptersSection = () => {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "cap1",
      title: "Introducción y objetivos",
      duration: "15 min",
      summary: "Contextualiza a los estudiantes y plantea qué van a lograr.",
    },
    {
      id: "cap2",
      title: "Fundamentos de JavaScript",
      duration: "45 min",
      summary: "Variables, funciones y estructuras básicas para comenzar a programar.",
    },
  ]);
  const [formData, setFormData] = useState({ title: "", duration: "", summary: "" });
  const [videoName, setVideoName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(
    () => formData.title.trim().length > 0 && formData.duration.trim().length > 0,
    [formData],
  );

  const handleAddChapter = () => {
    if (!canSubmit) {
      return;
    }
    const nextChapter: Chapter = {
      id: crypto.randomUUID(),
      title: formData.title,
      duration: formData.duration,
      summary: formData.summary,
    };
    setChapters((prev) => [...prev, nextChapter]);
    setFormData({ title: "", duration: "", summary: "" });
  };

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoName(file.name);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Capítulos del curso</h2>
          <p className="text-sm text-muted-foreground">
            Planifica la estructura del contenido y agrega nuevas sesiones.
          </p>
        </div>
        <Badge variant="outline">{chapters.length} capítulos</Badge>
      </div>
      <Card className="border border-border bg-card/80 space-y-4">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-lg font-semibold text-foreground">Agregar capítulo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-0">
          <div>
            <Input
              label="Título *"
              placeholder="Capítulo 3 · Manejo de datos"
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div>
            <Input
              label="Duración estimada *"
              placeholder="45 min"
              value={formData.duration}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, duration: event.target.value }))
              }
            />
          </div>
          <div>
            <Textarea
              label="Resumen"
              placeholder="Describe brevemente qué aprenderán los estudiantes."
              value={formData.summary}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, summary: event.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Video introductorio</p>
              <p className="text-xs text-muted-foreground">
                Puedes subir un archivo corto (MP4, WEBM).
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="w-full rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Subir video
                </button>
                {videoName && <span className="text-sm text-muted-foreground">{videoName}</span>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoChange}
              />
            </div>
            <Button
              className="w-full"
              variant="outline"
              size="default"
              onClick={handleAddChapter}
              disabled={!canSubmit}
            >
              Agregar capítulo
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {chapters.map((chapter, index) => (
          <Card key={chapter.id} className="border border-border bg-card/80">
            <CardHeader className="flex items-center justify-between px-4 pt-4">
              <div>
                <p className="text-base font-semibold text-foreground">
                  {index + 1}. {chapter.title}
                </p>
                <p className="text-xs text-muted-foreground">{chapter.duration}</p>
              </div>
              <Badge variant="outline">Capítulo</Badge>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <p className="text-sm text-muted-foreground">{chapter.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

