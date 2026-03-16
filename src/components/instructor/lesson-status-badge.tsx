"use client";

import { getLessonCompletion } from "@/lib/course-completion";
import type { CourseLesson } from "./course-types";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonStatusBadgeProps {
  lesson: CourseLesson;
  showPercentage?: boolean;
  className?: string;
}

export function LessonStatusBadge({
  lesson,
  showPercentage = false,
  className,
}: LessonStatusBadgeProps) {
  const { canPublish, statusLabel, statusTone, percentage } = getLessonCompletion(lesson);

  const styles = {
    error: {
      container: "border-destructive/30 bg-destructive/8 text-destructive",
      icon: AlertCircle,
    },
    warning: {
      container: "border-amber-400/40 bg-amber-50/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      icon: AlertTriangle,
    },
    success: {
      container: "border-green-400/40 bg-green-50/80 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      icon: CheckCircle2,
    },
  } as const;

  const { container, icon: Icon } = styles[statusTone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        container,
        className,
      )}
      title={`${statusLabel}${showPercentage ? ` — ${percentage}%` : ""}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {statusLabel}
      {showPercentage && <span className="opacity-70">· {percentage}%</span>}
    </span>
  );
}
