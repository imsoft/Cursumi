import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorEarnings } from "@/lib/instructor-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const [courses, enrollments, earnings] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId: session.user.id },
        select: { id: true, status: true },
      }),
      prisma.enrollment.findMany({
        where: { course: { instructorId: session.user.id } },
        select: { progress: true },
      }),
      getInstructorEarnings(session.user.id),
    ]);

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === "published").length;
    const totalStudents = enrollments.length;
    const avgProgress =
      enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0;

    return NextResponse.json({
      totalCourses,
      publishedCourses,
      totalStudents,
      avgProgress,
      earnings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
