import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            member: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
          },
        },
        courseAccess: {
          include: { course: { select: { id: true, title: true, imageUrl: true } } },
        },
      },
    });

    if (!team || team.organizationId !== org.id) {
      throw new ApiError(404, "Equipo no encontrado");
    }

    return NextResponse.json({ team });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.organizationId !== org.id) {
      throw new ApiError(404, "Equipo no encontrado");
    }

    const { name, description } = await req.json();
    const updated = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ team: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.organizationId !== org.id) {
      throw new ApiError(404, "Equipo no encontrado");
    }

    await prisma.team.delete({ where: { id: teamId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
