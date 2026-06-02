"use client";

import { getCourseCompletion } from "@/lib/course-completion";
import type { CourseFormData } from "./course-types";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  BookOpen,
  LayoutList,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseStatusPanelProps {
  courseData: CourseFormData;
  className?: string;
}

export function CourseStatusPanel({ courseData, className }: CourseStatusPanelProps) {
  const completion = getCourseCompletion(courseData);
  const { percentage, required, recommended, canPublish, statusLabel, statusTone, actionMessage, stats } = completion;

  // ── Progress ring ─────────────────────────────────────────────────────────
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ringColor = statusTone === "success"
    ? "text-green-500"
    : statusTone === "warning"
      ? "text-amber-500"
      : "text-destructive";

  const toneBanner = {
    error: "border-destructive/30 bg-destructive/8 text-destructive",
    warning: "border-amber-400/40 bg-amber-50/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    success: "border-green-400/40 bg-green-50/80 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  } as const;

  const ToneIcon = statusTone === "success"
    ? CheckCircle2
    : statusTone === "warning"
      ? AlertTriangle
      : AlertCircle;

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5",
        className,
      )}
    >
      {/* Header + ring */}
      <div className="flex items-center gap-4">
        {/* SVG progress ring */}
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 72 72" aria-hidden>
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              strokeWidth="7"
              className="text-muted/40 stroke-current"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn("stroke-current transition-all duration-500", ringColor)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
            {percentage}%
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Estado del curso
          </p>
          <p className="mt-0.5 text-base font-bold text-foreground leading-tight">
            {statusLabel}
          </p>
        </div>
      </div>

      {/* Action banner */}
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium",
          toneBanner[statusTone],
        )}
      >
        <ToneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{actionMessage}</span>
      </div>

      {/* Required items */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Requerido para publicar
        </p>
        <ul className="space-y-1.5">
          {required.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              {item.fulfilled ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span
                className={cn(
                  item.fulfilled ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended items */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Recomendado
        </p>
        <ul className="space-y-1.5">
          {recommended.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              {item.fulfilled ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span
                className={cn(
                  item.fulfilled ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Estadísticas
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <LayoutList className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold text-foreground">{stats.totalSections}</span>{" "}
              {stats.totalSections === 1 ? "sección" : "secciones"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold text-foreground">{stats.totalLessons}</span>{" "}
              {stats.totalLessons === 1 ? "lección" : "lecciones"}
            </span>
          </div>
          {stats.totalDurationMinutes > 0 && (
            <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold text-foreground">{stats.totalDurationFormatted}</span>{" "}
                de contenido
              </span>
            </div>
          )}
          {stats.totalLessons > 0 && (
            <>
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  <span className="font-semibold">{stats.lessonsReady}</span> listas
                </span>
              </div>
              {stats.lessonsIncomplete > 0 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    <span className="font-semibold">{stats.lessonsIncomplete}</span> incompletas
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Publish readiness indicator */}
      {!canPublish && (
        <p className="text-xs text-destructive font-medium text-center">
          Completa los elementos requeridos para poder publicar
        </p>
      )}
    </aside>
  );
}
