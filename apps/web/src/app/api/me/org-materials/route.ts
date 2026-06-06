import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api-helpers";

/**
 * Materiales internos de la organización del usuario (vista del miembro).
 * Devuelve lista vacía si el usuario no pertenece a ninguna organización.
 */
export async function GET() {
  try {
    const session = await requireSession();

    const membership = await prisma.orgMember.findFirst({
      where: { userId: session.user.id },
      select: {
        organization: {
          select: {
            name: true,
            materials: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                description: true,
                fileUrl: true,
                fileType: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ orgName: null, materials: [] });
    }

    return NextResponse.json({
      orgName: membership.organization.name,
      materials: membership.organization.materials,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
