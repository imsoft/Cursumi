import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const materials = await prisma.orgMaterial.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ materials });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const { name, description, fileUrl, fileType, fileSize } = await req.json();
    if (!name || !fileUrl || !fileType) {
      throw new ApiError(400, "Nombre, URL y tipo de archivo son requeridos");
    }

    const material = await prisma.orgMaterial.create({
      data: {
        organizationId: org.id,
        name,
        description,
        fileUrl,
        fileType,
        fileSize,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
