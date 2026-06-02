import { NextRequest, NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const session = await getCachedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course || course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      enrollment: { courseId },
    },
    select: {
      id: true,
      content: true,
      submittedAt: true,
      updatedAt: true,
      lesson: { select: { id: true, title: true } },
      enrollment: {
        select: {
          student: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}
