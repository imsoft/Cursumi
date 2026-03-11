"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EnrolledWelcomeBannerProps {
  courseId: string;
  firstLessonId?: string | null;
}

export function EnrolledWelcomeBanner({ courseId, firstLessonId }: EnrolledWelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
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
