"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Reflection = {
  id: string;
  content: string;
  createdAt: string;
  authorLabel: string;
};

interface LearningReflectionsSectionProps {
  courseId: string;
}

export function LearningReflectionsSection({ courseId }: LearningReflectionsSectionProps) {
  const [items, setItems] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}/learning-reflections`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setItems(data.reflections ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            ¿Qué aprendieron?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          ¿Qué aprendieron?
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Respuestas de personas que ya tomaron el curso (solo mostramos el nombre de pila).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((r) => (
          <blockquote
            key={r.id}
            className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-foreground"
          >
            <p className="whitespace-pre-wrap">{r.content}</p>
            <footer className="mt-2 text-xs text-muted-foreground">
              — {r.authorLabel} ·{" "}
              {new Date(r.createdAt).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </footer>
          </blockquote>
        ))}
      </CardContent>
    </Card>
  );
}
