import { NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";
import { upsertLessonProgressForGateActivity } from "@/lib/gate-lesson-progress";
import { normalizeSectionActivities } from "@/lib/section-activities";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  const body = await req.json();
  const { courseId, activityId: rawActivityId } = body as {
    courseId: unknown;
    activityId?: unknown;
  };
  const activityId =
    typeof rawActivityId === "string" && rawActivityId.length > 0 ? rawActivityId : "default";

  if (typeof courseId !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  // Fetch section and resolve the target activity
  const section = await prisma.courseSection.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true, activities: true, quiz: true, minigame: true },
  });
  if (!section) return NextResponse.json({ error: "Sección no encontrada en este curso" }, { status: 404 });

  const activities = normalizeSectionActivities(section);
  const activity =
    activityId === "default"
      ? activities[0]
      : activities.find((a) => a.id === activityId);

  if (!activity) return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });

  // ── Quiz: calcular score en el servidor ─────────────────────────────────
  let score: number;
  let passed: boolean;

  if (activity.kind === "quiz") {
    const rawAnswers = body.answers;
    if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
      return NextResponse.json({ error: "Se requieren las respuestas del quiz" }, { status: 400 });
    }
    const answers = rawAnswers as Record<string, unknown>;
    const questions = activity.questions;

    const correct = questions.filter(
      (q, i) => typeof answers[String(i)] === "number" && answers[String(i)] === q.correct
    ).length;

    score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    passed = score >= (activity.passingScore ?? 70);
  } else {
    // Minigame: el score viene del cliente pero el servidor decide si aprobó
    const clientScore = body.score;
    if (typeof clientScore !== "number" || !Number.isFinite(clientScore)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    score = Math.min(100, Math.max(0, Math.round(clientScore)));
    passed = score >= 70; // minigame no tiene passingScore, usar umbral por defecto
  }

  const existing = await prisma.sectionQuizSubmission.findUnique({
    where: {
      enrollmentId_sectionId_activityId: {
        enrollmentId: enrollment.id,
        sectionId,
        activityId,
      },
    },
  });
  if (existing?.passed) {
    await upsertLessonProgressForGateActivity({
      enrollmentId: enrollment.id,
      courseId,
      sectionId,
      activityId,
    });
    await recalculateEnrollmentProgress(enrollment.id, courseId);
    return NextResponse.json({ passed: true, score: existing.score });
  }

  const submission = await prisma.sectionQuizSubmission.upsert({
    where: {
      enrollmentId_sectionId_activityId: {
        enrollmentId: enrollment.id,
        sectionId,
        activityId,
      },
    },
    update: { score, passed },
    create: { enrollmentId: enrollment.id, sectionId, activityId, score, passed },
  });

  if (submission.passed) {
    await upsertLessonProgressForGateActivity({
      enrollmentId: enrollment.id,
      courseId,
      sectionId,
      activityId,
    });
    await recalculateEnrollmentProgress(enrollment.id, courseId);
  }

  return NextResponse.json({ passed: submission.passed, score: submission.score });
}
