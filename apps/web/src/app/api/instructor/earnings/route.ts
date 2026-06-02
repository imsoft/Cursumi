import { NextResponse } from "next/server";
import { getInstructorEarnings } from "@/lib/instructor-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const earnings = await getInstructorEarnings(session.user.id);
    return NextResponse.json(earnings);
  } catch (error) {
    return handleApiError(error);
  }
}
