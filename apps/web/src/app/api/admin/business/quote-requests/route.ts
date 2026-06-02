import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

/** Lista las solicitudes de cotización empresarial (leads). */
export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const requests = await prisma.businessQuoteRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["new", "contacted", "converted", "closed"]),
});

/** Actualiza el estado de una solicitud (new → contacted → converted/closed). */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id, status } = patchSchema.parse(await req.json());
    const updated = await prisma.businessQuoteRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
