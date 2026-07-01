import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { createNotification } from "@/lib/notification-helpers";
import { recordAuditLog } from "@/lib/audit-log";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { action, reason, force } = await req.json() as {
      action: "disable" | "enable";
      reason?: string;
      /** Solo admin: re-publicar aunque la planeación esté incompleta (cursos legacy) */
      force?: boolean;
    };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true, status: true, modality: true },
    });
    if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });

    let forcedIncompletePlanning = false;

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
      // Mismo requisito que para instructores: no re-publicar sin planeación completa.
      // El admin puede forzar (force) para cursos legacy; queda registrado en el audit log.
      if (course.modality === "evento" || course.modality === "virtual") {
        const { getPlanningExpedientStatus } = await import("@/lib/planning/completion");
        const planning = await getPlanningExpedientStatus(courseId, course.modality as "evento" | "virtual");
        if (!planning.isComplete) {
          if (!force) {
            return NextResponse.json(
              {
                error: `No se puede publicar: la planeación didáctica está incompleta (${planning.completed}/${planning.total}).`,
                details: planning.missing.map((m) => `Falta: ${m}`),
                canForce: true,
              },
              { status: 422 },
            );
          }
          forcedIncompletePlanning = true;
        }
      }

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

    await recordAuditLog({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: action === "disable" ? "course.disable" : "course.enable",
      targetType: "course",
      targetId: courseId,
      metadata: {
        title: course.title,
        instructorId: course.instructorId,
        ...(reason ? { reason } : {}),
        ...(action === "enable" && forcedIncompletePlanning ? { forcedIncompletePlanning: true } : {}),
      },
      req,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
