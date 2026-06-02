import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { createNotification } from "@/lib/notification-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { action, reason } = await req.json() as { action: "disable" | "enable"; reason?: string };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true, status: true },
    });
    if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });

    if (action === "disable") {
      await prisma.course.update({
        where: { id: courseId },
        data: { status: "archived" },
      });

      await createNotification({
        userId: course.instructorId,
        type: "course_disabled",
        title: "Tu curso fue deshabilitado",
        body: `Tu curso "${course.title}" ha sido deshabilitado por el administrador.${reason ? ` Motivo: ${reason}` : ""}`,
        link: `/instructor/courses/${courseId}`,
      });
    } else {
      await prisma.course.update({
        where: { id: courseId },
        data: { status: "published" },
      });

      await createNotification({
        userId: course.instructorId,
        type: "course_enabled",
        title: "Tu curso fue habilitado",
        body: `Tu curso "${course.title}" ha sido habilitado nuevamente.`,
        link: `/instructor/courses/${courseId}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
