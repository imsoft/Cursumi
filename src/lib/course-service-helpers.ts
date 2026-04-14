/**
 * Helpers internos compartidos entre los sub-módulos de course-service.
 * No se re-exportan desde el barrel — son detalles de implementación.
 */
import { Prisma } from "@/generated/prisma";
import type { CourseSection, CourseSessionData } from "@/components/instructor/course-types";
import { ensureActivityIds, normalizeSectionActivities } from "@/lib/section-activities";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";
import { prisma } from "./prisma";

// ─── Serialización de secciones ───────────────────────────────────────────────

export function sectionJsonForPrisma(section: CourseSection): {
  quiz: Prisma.InputJsonValue | typeof Prisma.JsonNull;
  minigame: Prisma.InputJsonValue | typeof Prisma.JsonNull;
  activities: Prisma.InputJsonValue | typeof Prisma.JsonNull;
} {
  const merged = normalizeSectionActivities(section);
  if (merged.length > 0) {
    return {
      activities: ensureActivityIds(merged) as unknown as Prisma.InputJsonValue,
      quiz: Prisma.JsonNull,
      minigame: Prisma.JsonNull,
    };
  }
  return {
    activities: Prisma.JsonNull,
    quiz: section.quiz ? (section.quiz as Prisma.InputJsonValue) : Prisma.JsonNull,
    minigame: section.minigame ? (section.minigame as Prisma.InputJsonValue) : Prisma.JsonNull,
  };
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

export function toSlugPart(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function generateCourseSlug(
  title: string,
  instructorName: string,
  excludeId?: string
): Promise<string> {
  const base = `${toSlugPart(title)}-por-${toSlugPart(instructorName)}`;
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.course.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

// ─── Fechas ───────────────────────────────────────────────────────────────────

export function formatDateLabel(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Inicio del día actual en UTC */
export function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function computeNextSessionFromData(sessions?: CourseSessionData[]): Date | null {
  if (!sessions?.length) return null;
  const todayStart = startOfTodayUTC();
  const futureDates = sessions
    .map((s) => new Date(s.date))
    .filter((d) => d >= todayStart)
    .sort((a, b) => a.getTime() - b.getTime());
  return futureDates[0] ?? null;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function recalculateAllEnrollments(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { id: true },
  });
  if (enrollments.length === 0) return;
  for (const enrollment of enrollments) {
    await recalculateEnrollmentProgress(enrollment.id, courseId);
  }
}
