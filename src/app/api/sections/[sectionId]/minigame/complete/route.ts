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
  const { courseId } = await req.json();

  if (typeof courseId !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  // Minigames are always marked as passed (no score requirement)
  const existing = await prisma.sectionQuizSubmission.findUnique({
    where: { enrollmentId_sectionId: { enrollmentId: enrollment.id, sectionId } },
  });
  if (existing?.passed) {
    return NextResponse.json({ passed: true });
  }

  await prisma.sectionQuizSubmission.upsert({
    where: { enrollmentId_sectionId: { enrollmentId: enrollment.id, sectionId } },
    update: { score: 100, passed: true },
    create: { enrollmentId: enrollment.id, sectionId, score: 100, passed: true },
  });

  return NextResponse.json({ passed: true });
}
