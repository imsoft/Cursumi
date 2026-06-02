import { NextResponse } from "next/server";
import { getAdminFinances } from "@/lib/admin-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const data = await getAdminFinances();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
