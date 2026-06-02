import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
