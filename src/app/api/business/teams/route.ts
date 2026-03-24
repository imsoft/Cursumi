import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const teams = await prisma.team.findMany({
      where: { organizationId: org.id },
      include: {
        _count: { select: { members: true, courseAccess: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const { name, description } = await req.json();
    if (!name?.trim()) throw new ApiError(400, "El nombre es requerido");

    const team = await prisma.team.create({
      data: { organizationId: org.id, name: name.trim(), description },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
