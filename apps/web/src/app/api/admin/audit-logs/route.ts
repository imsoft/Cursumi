import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

// GET /api/admin/audit-logs?limit=200 — bitácora de acciones sensibles (la misma
// que /admin/audit-logs en la web); la usan las apps nativas.
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const raw = Number.parseInt(req.nextUrl.searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), 500) : 200;
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return NextResponse.json(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
