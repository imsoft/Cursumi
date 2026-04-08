import { NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { recalculateEnrollmentProgress } from "@/lib/enrollment-progress";
import { upsertLessonProgressForGateActivity } from "@/lib/gate-lesson-progress";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  const body = await req.json();
  const { courseId, score, passed } = body as {
    courseId: unknown;
    score: unknown;
    passed: unknown;
    activityId?: unknown;
  };
  const activityId =
    typeof body.activityId === "string" && body.activityId.length > 0 ? body.activityId : "default";

  if (typeof courseId !== "string" || typeof score !== "number" || typeof passed !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (score < 0 || score > 100) {
    return NextResponse.json({ error: "Score debe estar entre 0 y 100" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  // Verificar que la sección pertenezca al curso
  const section = await prisma.courseSection.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) return NextResponse.json({ error: "Sección no encontrada en este curso" }, { status: 404 });

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
