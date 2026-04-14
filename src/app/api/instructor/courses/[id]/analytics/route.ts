import { NextRequest, NextResponse } from "next/server";
import { getCourseDetail } from "@/lib/course-service";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export type LessonFunnelItem = {
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  sectionId: string;
  sectionTitle: string;
  order: number;
  completions: number;
  completionRate: number;   // 0-100
  avgScore: number | null;  // solo para quizzes
};

export type CourseAnalytics = {
  totalEnrolled: number;
  completed: number;
  completionRate: number;   // 0-100
  avgProgress: number;      // 0-100
  dropoffLessonId: string | null;
  lessonFunnel: LessonFunnelItem[];
  sectionQuizPassRates: {
    sectionId: string;
    sectionTitle: string;
    passRate: number;
    attempts: number;
  }[];
  weeklyEnrollments: { week: string; count: number }[];
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await context.params;
    const session = await requireSession();
    const role = await requireRole(session.user.id, ["instructor", "admin"]);

    const course = await getCourseDetail(courseId);
    if (!course || (course.instructorId !== session.user.id && role !== "admin")) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Carga en paralelo: todos los datos necesarios para el analytics
    const [enrollments, lessonProgressRows, sectionQuizRows, weeklyRows] = await Promise.all([
      // Progreso general por estudiante
      prisma.enrollment.findMany({
        where: { courseId },
        select: { id: true, status: true, progress: true },
      }),

      // Progreso por lección: cuántos completaron cada una
      prisma.lessonProgress.findMany({
        where: { enrollment: { courseId } },
        select: {
          lessonId: true,
          score: true,
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
              order: true,
              section: { select: { id: true, title: true, order: true } },
            },
          },
        },
      }),

      // Quizzes de sección: tasas de aprobación
      prisma.sectionQuizSubmission.findMany({
        where: { enrollment: { courseId } },
        select: {
          sectionId: true,
          passed: true,
          section: { select: { id: true, title: true } },
        },
      }),

      // Inscripciones por semana (últimas 12 semanas)
      prisma.$queryRaw<{ week: string; count: bigint }[]>`
        SELECT
          to_char(date_trunc('week', "createdAt"), 'YYYY-MM-DD') AS week,
          COUNT(*) AS count
        FROM "Enrollment"
        WHERE "courseId" = ${courseId}
          AND "createdAt" >= now() - interval '12 weeks'
        GROUP BY date_trunc('week', "createdAt")
        ORDER BY 1
      `,
    ]);

    const totalEnrolled = enrollments.length;
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const completionRate = totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;
    const avgProgress =
      totalEnrolled > 0
        ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / totalEnrolled)
        : 0;

    // Construir el funnel de lecciones
    const completionsByLesson = new Map<string, { scores: number[]; lesson: typeof lessonProgressRows[0]["lesson"] }>();
    for (const row of lessonProgressRows) {
      if (!completionsByLesson.has(row.lessonId)) {
        completionsByLesson.set(row.lessonId, { scores: [], lesson: row.lesson });
      }
      if (row.score != null) {
        completionsByLesson.get(row.lessonId)!.scores.push(row.score);
      } else {
        // Completado sin score (video, texto)
        completionsByLesson.get(row.lessonId)!.scores; // solo contamos la presencia
      }
    }

    // Obtener todas las lecciones del curso en orden
    const allLessons = course.sections
      .sort((a, b) => a.order - b.order)
      .flatMap((s) =>
        s.lessons
          .sort((a, b) => a.order - b.order)
          .map((l) => ({ ...l, sectionId: s.id, sectionTitle: s.title }))
      );

    const lessonFunnel: LessonFunnelItem[] = allLessons.map((lesson) => {
      const data = completionsByLesson.get(lesson.id);
      const completions = lessonProgressRows.filter((r) => r.lessonId === lesson.id).length;
      const completionRate = totalEnrolled > 0 ? Math.round((completions / totalEnrolled) * 100) : 0;
      const scores = data?.scores.filter((s) => s != null) ?? [];
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonType: lesson.type,
        sectionId: lesson.sectionId,
        sectionTitle: lesson.sectionTitle,
        order: lesson.order,
        completions,
        completionRate,
        avgScore,
      };
    });

    // Lección con mayor caída: la de menor completion rate (excluyendo 0 totales)
    const funnelWithData = lessonFunnel.filter((l) => l.completions >= 0 && totalEnrolled > 0);
    const dropoffLesson = funnelWithData.length > 1
      ? funnelWithData.reduce((min, l) => (l.completionRate < min.completionRate ? l : min))
      : null;

    // Quizzes de sección
    const quizBySection = new Map<string, { title: string; passed: number; total: number }>();
    for (const row of sectionQuizRows) {
      if (!quizBySection.has(row.sectionId)) {
        quizBySection.set(row.sectionId, { title: row.section?.title ?? "", passed: 0, total: 0 });
      }
      const entry = quizBySection.get(row.sectionId)!;
      entry.total += 1;
      if (row.passed) entry.passed += 1;
    }

    const sectionQuizPassRates = [...quizBySection.entries()].map(([sectionId, data]) => ({
      sectionId,
      sectionTitle: data.title,
      passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
      attempts: data.total,
    }));

    const weeklyEnrollments = weeklyRows.map((r) => ({
      week: r.week,
      count: Number(r.count),
    }));

    const analytics: CourseAnalytics = {
      totalEnrolled,
      completed,
      completionRate,
      avgProgress,
      dropoffLessonId: dropoffLesson?.lessonId ?? null,
      lessonFunnel,
      sectionQuizPassRates,
      weeklyEnrollments,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    return handleApiError(error);
  }
}
