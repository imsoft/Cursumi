import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError, ApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";
import { sendOrgInviteEmail } from "@/lib/email";
import type { OrgRole } from "@/generated/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const { email, orgRole = "member" } = (await req.json()) as {
      email: string;
      orgRole?: OrgRole;
    };

    if (!email) throw new ApiError(400, "Email es requerido");

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.orgMember.findUnique({
        where: { organizationId_userId: { organizationId: org.id, userId: existingUser.id } },
      });
      if (existingMember) {
        throw new ApiError(400, "Este usuario ya es miembro de tu organización");
      }
    }

    // Check for pending invite
    const pendingInvite = await prisma.orgInvite.findFirst({
      where: { organizationId: org.id, email, status: "pending" },
    });
    if (pendingInvite) {
      throw new ApiError(400, "Ya existe una invitación pendiente para este email");
    }

    // Check seat limit
    const sub = await prisma.orgSubscription.findUnique({
      where: { organizationId: org.id },
    });
    if (sub) {
      const currentMembers = await prisma.orgMember.count({
        where: { organizationId: org.id },
      });
      if (currentMembers >= sub.maxSeats) {
        throw new ApiError(400, `Has alcanzado el límite de ${sub.maxSeats} asientos. Actualiza tu suscripción.`);
      }
    }

    const invite = await prisma.orgInvite.create({
      data: {
        organizationId: org.id,
        email,
        orgRole: orgRole === "owner" ? "member" : orgRole,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const inviteLink = `${BASE_URL}/business/invite/${invite.token}`;
    await sendOrgInviteEmail({
      to: email,
      orgName: org.name,
      inviterName: session.user.name || "Un administrador",
      inviteLink,
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);

    const invitations = await prisma.orgInvite.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    return handleApiError(error);
  }
}
