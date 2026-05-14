import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  unit: z.string().max(20).optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  period: z.enum(["diario", "semanal", "mensual", "trimestral", "anual"]).optional(),
  category: z.enum(["crecimiento", "ingresos", "engagement", "calidad", "general"]).optional(),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = updateSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Datos inválidos", details: body.error.flatten() }, { status: 400 });
    }

    const { deadline, ...rest } = body.data;
    const kpi = await prisma.kpi.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
      },
    });

    return NextResponse.json(kpi);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    await prisma.kpi.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
