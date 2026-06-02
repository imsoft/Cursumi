import { NextRequest, NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, content } = await req.json();
  if (!courseId || !content?.trim()) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
    select: { id: true },
  });
  if (!enrollment) return NextResponse.json({ error: "No inscrito" }, { status: 403 });

  const submission = await prisma.assignmentSubmission.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    create: { enrollmentId: enrollment.id, lessonId, content: content.trim() },
    update: { content: content.trim() },
  });

  return NextResponse.json({ ok: true, submissionId: submission.id });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "Falta courseId" }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
    select: { id: true },
  });
  if (!enrollment) return NextResponse.json({ submission: null });

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    select: { content: true, submittedAt: true },
  });

  return NextResponse.json({ submission });
}
