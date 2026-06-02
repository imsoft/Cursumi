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
    // Todo en una sola transacción para garantizar consistencia
    await prisma.$transaction(async (tx) => {
      await tx.instructorApplication.update({
        where: { id },
        data: { status: "approved" },
      });
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "instructor" },
      });
      // InstructorProfile dentro de la transacción
      await tx.instructorProfile.upsert({
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
      await tx.notification.create({
        data: {
          userId: application.userId,
          type: "instructor_approved",
          title: "¡Solicitud aprobada!",
          body: "Tu solicitud para convertirte en instructor ha sido aprobada. Ya puedes crear y publicar cursos.",
          link: "/instructor",
        },
      });
    });
  } else if (body.data.action === "reject") {
    const { rejectionReason } = body.data;
    await prisma.$transaction(async (tx) => {
      await tx.instructorApplication.update({
        where: { id },
        data: {
          status: "rejected",
          rejectionReason,
        },
      });
      await tx.notification.create({
        data: {
          userId: application.userId,
          type: "instructor_rejected",
          title: "Solicitud de instructor rechazada",
          body: `Tu solicitud no fue aprobada. Motivo: ${rejectionReason}`,
          link: "/dashboard/become-instructor",
        },
      });
    });
  }

  return NextResponse.json({ success: true });
}
