import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { provisionOrganization } from "@/lib/org-service";
import { sendOrgInviteEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com";

const bodySchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  ownerEmail: z.string().email(),
  maxSeats: z.number().int().positive(),
  // monto acordado en pesos (MXN); se guarda en centavos
  amount: z.number().positive(),
  billingInterval: z.enum(["month", "year"]),
  courseIds: z.array(z.string()).default([]),
  quoteRequestId: z.string().optional(),
});

/** Lista las organizaciones (para el panel de admin). */
export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
        _count: { select: { members: true, courseAccess: true } },
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Provisiona una organización con la cotización acordada (estado pending). */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const data = bodySchema.parse(await req.json());

    const result = await provisionOrganization({
      name: data.name,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone ?? null,
      address: data.address ?? null,
      ownerEmail: data.ownerEmail,
      maxSeats: data.maxSeats,
      amountCents: Math.round(data.amount * 100),
      billingInterval: data.billingInterval,
      courseIds: data.courseIds,
      provisionedBy: session.user.id,
    });

    // Si el dueño no tenía cuenta, enviarle el correo con su invitación (igual
    // que a los empleados), en vez de que el admin copie el link a mano.
    if (result.inviteToken) {
      await sendOrgInviteEmail({
        to: data.ownerEmail.toLowerCase().trim(),
        orgName: result.org.name,
        inviterName: "El equipo de Cursumi",
        inviteLink: `${BASE_URL}/business/invite/${result.inviteToken}`,
      }).catch(() => null); // no romper la provisión si falla el correo
    }

    // Si vino de una solicitud de cotización, marcarla como convertida.
    if (data.quoteRequestId) {
      await prisma.businessQuoteRequest
        .update({
          where: { id: data.quoteRequestId },
          data: { status: "converted" },
        })
        .catch(() => null);
    }

    return NextResponse.json(
      {
        organization: result.org,
        ownerHadAccount: result.ownerHadAccount,
        inviteToken: result.inviteToken,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
