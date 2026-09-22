import { NextResponse } from "next/server";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { listPendingPayouts } from "@/lib/payouts";

// GET /api/admin/payouts — parte del instructor cobrada por Cursumi y aún no transferida.
export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const groups = await listPendingPayouts();
    const totalPendingCents = groups.reduce((s, g) => s + g.pendingCents, 0);
    return NextResponse.json({ groups, totalPendingCents });
  } catch (error) {
    return handleApiError(error);
  }
}
