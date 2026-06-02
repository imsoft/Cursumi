import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { createOrganization, slugifyOrg, resolveOrgAdmin } from "@/lib/org-service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { name, contactEmail, contactPhone, address, logoUrl } = await req.json();

    if (!name || !contactEmail) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }

    const slug = slugifyOrg(name);
    const org = await createOrganization({
      name,
      slug,
      contactEmail,
      contactPhone,
      address,
      logoUrl,
      ownerId: session.user.id,
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

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
