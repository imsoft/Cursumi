import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

// Nota: la creación de organizaciones ya NO es self-serve. En el modelo de
// cotización a medida, el admin de Cursumi las provisiona en
// POST /api/admin/business/organizations. Aquí solo quedan lectura/edición
// para el dueño/admin de la organización.

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const organization = await prisma.organization.findUnique({
      where: { id: org.id },
      include: {
        subscription: true,
        _count: { select: { members: true, courseAccess: true, materials: true } },
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const { name, contactEmail, contactPhone, address, logoUrl } = await req.json();

    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: {
        ...(name && { name }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(address !== undefined && { address }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return NextResponse.json({ organization: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
