import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

const patchSchema = z.object({
  role: z.enum(["student", "instructor", "admin"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const { id } = await params;
    const body = await req.json();
    const { role } = patchSchema.parse(body);

    // Un admin no puede modificar su propio rol
    if (id === session.user.id) {
      return NextResponse.json({ error: "No puedes cambiar tu propio rol" }, { status: 403 });
    }

    // Un admin no puede modificar a otro admin
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (target?.role === "admin") {
      return NextResponse.json({ error: "No puedes cambiar el rol de otro administrador" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
