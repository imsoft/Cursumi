import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            progress: true,
            status: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
                modality: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        // For instructors: courses they teach
        instructorCourses: {
          select: {
            id: true,
            title: true,
            modality: true,
            status: true,
            _count: { select: { enrollments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const data = users.map((user) => ({
      id: user.id,
      name: user.name || "Usuario",
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      coursesCount: user.enrollments.length,
      enrolledCourses: user.enrollments.map((e) => ({
        enrollmentId: e.id,
        courseId: e.course.id,
        courseTitle: e.course.title,
        modality: e.course.modality,
        progress: e.progress,
        status: e.status,
        enrolledAt: e.createdAt.toISOString(),
      })),
      teachingCourses: user.instructorCourses.map((c) => ({
        courseId: c.id,
        courseTitle: c.title,
        modality: c.modality,
        status: c.status,
        studentsCount: c._count.enrollments,
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
