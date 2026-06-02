"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EnrolledWelcomeBannerProps {
  courseId: string;
  firstLessonId?: string | null;
  /** Precio pagado en MXN; 0 si el curso es gratuito. */
  price?: number;
  courseTitle?: string;
}

export function EnrolledWelcomeBanner({ courseId, firstLessonId, price, courseTitle }: EnrolledWelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Evento de conversión: compra completada. Solo cursos de pago y una sola vez.
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    if (price && price > 0) {
      track("purchase", { courseId, price, course: courseTitle ?? "" });
    }
  }, [courseId, price, courseTitle]);

  if (dismissed) return null;

  const contentHref = firstLessonId
    ? `/dashboard/my-courses/${courseId}/lessons/${firstLessonId}`
    : `/dashboard/my-courses/${courseId}`;

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30 px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-green-800 dark:text-green-200">
        ¡Bienvenido al curso! Ya puedes empezar cuando quieras.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild size="sm" variant="default">
          <Link href={contentHref}>{firstLessonId ? "Comenzar primera lección" : "Ver contenido"}</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-700 dark:text-green-300"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
