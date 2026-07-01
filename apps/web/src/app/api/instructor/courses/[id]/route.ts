import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      const validation = validateCourseForPublish({
        title: course.title ?? "",
        imageUrl: course.imageUrl,
        modality: course.modality,
        isFree: course.isFree,
        price: course.price,
        sections: course.sections,
        sessionsCount: course.courseSessions?.length ?? 0,
      });
      if (!validation.canPublish) {
        return NextResponse.json(
          { error: "El curso no cumple los requisitos para publicarse", details: validation.errors },
          { status: 422 },
        );
      }

      // La planeación didáctica debe estar completa al 100% para publicar
      const { getPlanningExpedientStatus } = await import("@/lib/planning/completion");
      const planning = await getPlanningExpedientStatus(id, (course.modality ?? "virtual") as "virtual" | "evento");
      if (!planning.isComplete) {
        return NextResponse.json(
          {
            error: `Completa la planeación didáctica antes de publicar (${planning.completed}/${planning.total}).`,
            details: planning.missing.map((m) => `Falta: ${m}`),
          },
          { status: 422 },
        );
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/instructor/courses");
    revalidatePath("/dashboard/my-courses");

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
