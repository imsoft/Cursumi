import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";
import { enrollOrgInCourse } from "@/lib/org-enrollment";

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const courseAccess = await prisma.orgCourseAccess.findMany({
      where: { organizationId: org.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            category: true,
            modality: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { grantedAt: "desc" },
    });

    // Also get enrollments for this org per course for metrics
    const enrollments = await prisma.enrollment.findMany({
      where: { organizationId: org.id },
      select: { courseId: true, progress: true, status: true },
    });

    const courseMetrics = new Map<string, { enrolled: number; avgProgress: number; completed: number }>();
    for (const e of enrollments) {
      const m = courseMetrics.get(e.courseId) || { enrolled: 0, avgProgress: 0, completed: 0 };
      m.enrolled++;
      m.avgProgress += e.progress;
      if (e.status === "completed") m.completed++;
      courseMetrics.set(e.courseId, m);
    }
    for (const [key, m] of courseMetrics) {
      if (m.enrolled > 0) m.avgProgress = Math.round(m.avgProgress / m.enrolled);
      courseMetrics.set(key, m);
    }

    const courses = courseAccess.map((ca) => ({
      ...ca.course,
      grantedAt: ca.grantedAt,
      orgMetrics: courseMetrics.get(ca.courseId) || { enrolled: 0, avgProgress: 0, completed: 0 },
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const { courseId } = await req.json();
    if (!courseId) throw new ApiError(400, "courseId es requerido");

    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, visibility: true },
    });
    if (!course || course.status !== "published") {
      throw new ApiError(404, "Curso no encontrado o no publicado");
    }

    // Check visibility
    if (course.visibility === "business_only" || course.visibility === "both" || course.visibility === "public") {
      // All visibility types are valid for business
    }

    const access = await prisma.orgCourseAccess.create({
      data: { organizationId: org.id, courseId },
    });

    // Auto-enroll all org members
    await enrollOrgInCourse(org.id, courseId);

    return NextResponse.json({ access }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
