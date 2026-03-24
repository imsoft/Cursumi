import { NextResponse } from "next/server";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { resolveOrgAdmin, listOrgMembers } from "@/lib/org-service";

export async function GET() {
  try {
    const session = await requireSession();
    const { org } = await resolveOrgAdmin(session.user.id);
    const members = await listOrgMembers(org.id);
    return NextResponse.json({ members });
  } catch (error) {
    return handleApiError(error);
  }
}
