import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

const getSchema = z.object({ courseId: z.string() });

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = req.nextUrl;
    const { courseId } = getSchema.parse({ courseId: searchParams.get("courseId") });

    // Find enrollment to get instructor
    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId: session.user.id } },
      include: { course: { select: { instructorId: true } } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    const instructorId = enrollment.course.instructorId;

    const conversation = await prisma.conversation.upsert({
      where: {
        courseId_studentId_instructorId: {
          courseId,
          studentId: session.user.id,
          instructorId,
        },
      },
      update: {},
      create: {
        courseId,
        studentId: session.user.id,
        instructorId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}
