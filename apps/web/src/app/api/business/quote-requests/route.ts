import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  companyName: z.string().min(2, "El nombre de la empresa es obligatorio"),
  contactName: z.string().min(2, "Tu nombre es obligatorio"),
  contactEmail: z.string().email("Correo inválido"),
  contactPhone: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

/** Solicitud pública de cotización empresarial (lead). */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (ip !== "unknown") {
      const limited = await checkRateLimitAsync({
        key: `quote-request:${ip}`,
        limit: 5,
        windowSecs: 3600,
      });
      if (limited) return limited;
    }

    const data = bodySchema.parse(await req.json());

    const request = await prisma.businessQuoteRequest.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone ?? undefined,
        companySize: data.companySize ?? undefined,
        interests: data.interests ?? undefined,
        message: data.message ?? undefined,
      },
    });

    return NextResponse.json({ id: request.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
