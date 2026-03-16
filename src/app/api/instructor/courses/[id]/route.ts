import { NextRequest, NextResponse } from "next/server";
import { getCourseDetail } from "@/lib/course-service";
import { prisma } from "@/lib/prisma";
import type { CourseStatus } from "@/generated/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();
    const role = await requireRole(session.user.id, ["instructor", "admin"]);

    const course = await getCourseDetail(id);
    if (!course || (course.instructorId !== session.user.id && role !== "admin")) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireSession();
    const role = await requireRole(session.user.id, ["instructor", "admin"]);
    const body = await req.json().catch(() => ({}));
    const status = body.status as CourseStatus | undefined;

    const course = await getCourseDetail(id);
    if (!course || (course.instructorId !== session.user.id && role !== "admin")) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    if (!status || !["draft", "published", "archived"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // Validate publish requirements when changing to published
    if (status === "published") {
      const { validateCourseForPublish } = await import("@/lib/course-completion");
      const sectionsCount = await prisma.courseSection.count({ where: { courseId: id } });
      const validation = validateCourseForPublish({
        title: course.title ?? "",
        imageUrl: course.imageUrl,
        sectionsCount,
      });
      if (!validation.canPublish) {
        return NextResponse.json(
          { error: "El curso no cumple los requisitos para publicarse", details: validation.errors },
          { status: 422 },
        );
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
