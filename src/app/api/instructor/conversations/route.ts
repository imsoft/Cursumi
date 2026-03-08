import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const { searchParams } = req.nextUrl;
    const courseId = searchParams.get("courseId");

    const where = courseId
      ? { instructorId: session.user.id, courseId }
      : { instructorId: session.user.id };

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        student: { select: { name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true, read: true, senderId: true },
        },
        course: { select: { title: true } },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    return handleApiError(error);
  }
}
