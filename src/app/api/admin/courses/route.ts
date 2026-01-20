import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const data = courses.map((course) => ({
      id: course.id,
      title: course.title,
      instructorName: course.instructor?.name || "Instructor",
      category: course.category,
      modality: course.modality,
      status: course.status,
      studentsCount: course._count.enrollments,
      price: course.price,
      createdAt: course.createdAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
