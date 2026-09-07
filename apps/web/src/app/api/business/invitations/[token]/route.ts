import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

/**
 * Revoca una invitación pendiente.
 *
 * Se identifica por token y no por id porque la carpeta dinámica ya se llama
 * `[token]` (la usa `/accept`) y Next.js no admite dos nombres distintos de
 * slug en el mismo nivel. El token viaja en el listado de invitaciones, así
 * que el panel ya lo tiene a mano.
 *
 * Borramos la fila en lugar de marcarla `expired`: el enlace deja de servir de
 * inmediato y una invitación pendiente cancelada no tiene valor histórico.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const invite = await prisma.orgInvite.findUnique({ where: { token } });
    if (!invite || invite.organizationId !== org.id) {
      throw new ApiError(404, "Invitación no encontrada");
    }
    if (invite.status === "accepted") {
      throw new ApiError(400, "Esta invitación ya fue aceptada; elimina al miembro en su lugar");
    }

    await prisma.orgInvite.delete({ where: { token } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
