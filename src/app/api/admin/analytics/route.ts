import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/admin-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    return handleApiError(error);
  }
}
