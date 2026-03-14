import { NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionId } = await params;
  const { courseId, score, passed } = await req.json();

  if (typeof courseId !== "string" || typeof score !== "number" || typeof passed !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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

  // Si ya aprobó, no sobreescribir el estado de aprobado
  const existing = await prisma.sectionQuizSubmission.findUnique({
    where: { enrollmentId_sectionId: { enrollmentId: enrollment.id, sectionId } },
  });
  if (existing?.passed) {
    return NextResponse.json({ passed: true, score: existing.score });
  }

  const submission = await prisma.sectionQuizSubmission.upsert({
    where: { enrollmentId_sectionId: { enrollmentId: enrollment.id, sectionId } },
    update: { score, passed },
    create: { enrollmentId: enrollment.id, sectionId, score, passed },
  });

  return NextResponse.json({ passed: submission.passed, score: submission.score });
}
