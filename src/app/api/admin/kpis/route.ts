import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  unit: z.string().max(20).default(""),
  targetValue: z.number().positive("El valor objetivo debe ser mayor a 0"),
  currentValue: z.number().min(0).default(0),
  period: z.enum(["diario", "semanal", "mensual", "trimestral", "anual"]).default("mensual"),
  category: z.enum(["crecimiento", "ingresos", "engagement", "calidad", "general"]).default("general"),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
});

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const kpis = await prisma.kpi.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(kpis);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const body = createSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Datos inválidos", details: body.error.flatten() }, { status: 400 });
    }

    const { deadline, ...rest } = body.data;
    const kpi = await prisma.kpi.create({
      data: { ...rest, deadline: deadline ? new Date(deadline) : null },
    });
    return NextResponse.json(kpi, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
