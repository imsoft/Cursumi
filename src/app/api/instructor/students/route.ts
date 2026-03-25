import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const courses = await prisma.course.findMany({
      where: { instructorId: session.user.id },
      select: {
        id: true,
        title: true,
        modality: true,
        status: true,
        enrollments: {
          select: {
            id: true,
            progress: true,
            status: true,
            createdAt: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = courses.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      modality: course.modality,
      status: course.status,
      students: course.enrollments.map((e) => ({
        enrollmentId: e.id,
        studentId: e.student.id,
        studentName: e.student.name || "Usuario",
        studentEmail: e.student.email,
        progress: e.progress,
        status: e.status,
        enrolledAt: e.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
