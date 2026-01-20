import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const data = users.map((user) => ({
      id: user.id,
      name: user.name || "Usuario",
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
