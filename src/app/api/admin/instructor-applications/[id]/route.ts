import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, requireRole } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), rejectionReason: z.string().min(1).max(500) }),
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  await requireRole(session.user.id, ["admin"]);

  const { id } = await params;
  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const application = await prisma.instructorApplication.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }
  if (application.status !== "pending") {
    return NextResponse.json({ error: "La solicitud ya fue procesada" }, { status: 409 });
  }

  if (body.data.action === "approve") {
    // Actualizar solicitud, rol del usuario y crear perfil de instructor
    await prisma.$transaction([
      prisma.instructorApplication.update({
        where: { id },
        data: { status: "approved" },
      }),
      prisma.user.update({
        where: { id: application.userId },
        data: { role: "instructor" },
      }),
    ]);

    // Crear InstructorProfile si no existe
    await prisma.instructorProfile.upsert({
      where: { userId: application.userId },
      update: {
        headline: application.headline ?? undefined,
        bio: application.bio ?? undefined,
      },
      create: {
        userId: application.userId,
        headline: application.headline ?? undefined,
        bio: application.bio ?? undefined,
      },
    });

    // Notificación al usuario
    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: "instructor_approved",
        title: "¡Solicitud aprobada!",
        body: "Tu solicitud para convertirte en instructor ha sido aprobada. Ya puedes crear y publicar cursos.",
        link: "/instructor",
      },
    });
  } else {
    await prisma.instructorApplication.update({
      where: { id },
      data: {
        status: "rejected",
        rejectionReason: body.data.rejectionReason,
      },
    });

    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: "instructor_rejected",
        title: "Solicitud de instructor rechazada",
        body: `Tu solicitud no fue aprobada. Motivo: ${body.data.rejectionReason}`,
        link: "/dashboard/become-instructor",
      },
    });
  }

  return NextResponse.json({ success: true });
}
