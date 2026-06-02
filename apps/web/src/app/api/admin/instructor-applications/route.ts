import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireRole } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await requireRole(session.user.id, ["admin"]);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // pending | approved | rejected | all

  const applications = await prisma.instructorApplication.findMany({
    where: status && status !== "all" ? { status: status as "pending" | "approved" | "rejected" } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({ applications });
}
