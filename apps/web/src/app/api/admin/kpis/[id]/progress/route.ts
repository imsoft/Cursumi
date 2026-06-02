import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  value: z.number().min(-1_000_000_000).max(1_000_000_000),
  note: z.string().max(500).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const entries = await prisma.kpiProgress.findMany({
      where: { kpiId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = createSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Datos inválidos", details: body.error.flatten() }, { status: 400 });
    }

    const kpi = await prisma.kpi.findUnique({ where: { id } });
    if (!kpi) return NextResponse.json({ error: "KPI no encontrado" }, { status: 404 });

    const [entry] = await prisma.$transaction([
      prisma.kpiProgress.create({
        data: { kpiId: id, value: body.data.value, note: body.data.note },
      }),
      prisma.kpi.update({
        where: { id },
        data: { currentValue: { increment: body.data.value } },
      }),
    ]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
