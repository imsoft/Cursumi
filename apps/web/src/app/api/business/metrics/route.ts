import { NextResponse } from "next/server";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin, getOrgMetrics } from "@/lib/org-service";

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);
    const metrics = await getOrgMetrics(org.id);
    return NextResponse.json(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
