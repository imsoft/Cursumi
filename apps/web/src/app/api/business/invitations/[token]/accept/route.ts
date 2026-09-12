import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { enrollMemberInOrgCourses } from "@/lib/org-enrollment";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await requireSession();

    const invite = await prisma.orgInvite.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) throw new ApiError(404, "Invitación no encontrada");
    if (invite.status !== "pending") throw new ApiError(400, "Esta invitación ya fue usada o expiró");
    if (invite.expiresAt < new Date()) {
      await prisma.orgInvite.update({ where: { id: invite.id }, data: { status: "expired" } });
      throw new ApiError(400, "La invitación ha expirado");
    }

    // Check if user email matches invite email
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.email !== invite.email) {
      throw new ApiError(400, "Esta invitación es para otro email. Inicia sesión con el correo invitado.");
    }

    // Check already member
    const existing = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invite.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (existing) {
      await prisma.orgInvite.update({ where: { id: invite.id }, data: { status: "accepted" } });
      return NextResponse.json({ message: "Ya eres miembro de esta organización" });
    }

    // El límite de asientos solo se comprobaba al CREAR la invitación, nunca
    // al aceptarla. Entre ambos momentos pueden pasar días: la empresa puede
    // haber bajado de plan o cancelado, y las invitaciones pendientes seguían
    // entrando igual. Se revalida aquí, que es cuando se ocupa el asiento.
    const sub = await prisma.orgSubscription.findUnique({
      where: { organizationId: invite.organizationId },
    });
    if (!sub || sub.status !== "active") {
      throw new ApiError(
        403,
        "La suscripción de esta organización no está activa. Pide a tu administrador que la reactive.",
      );
    }
    const currentMembers = await prisma.orgMember.count({
      where: { organizationId: invite.organizationId },
    });
    if (currentMembers >= sub.maxSeats) {
      throw new ApiError(
        403,
        `Esta organización ya ocupó sus ${sub.maxSeats} asientos. Pide a tu administrador que libere uno o amplíe el plan.`,
      );
    }

    // Create membership + update invite in transaction
    await prisma.$transaction(async (tx) => {
      await tx.orgMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: session.user.id,
          orgRole: invite.orgRole,
        },
      });
      await tx.orgInvite.update({ where: { id: invite.id }, data: { status: "accepted" } });
    });

    // Auto-enroll in org courses
    await enrollMemberInOrgCourses(session.user.id, invite.organizationId);

    return NextResponse.json({
      message: `Te has unido a ${invite.organization.name}`,
      organizationId: invite.organizationId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
