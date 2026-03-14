import { NextResponse } from "next/server";
import { createMuxUploadUrl } from "@/app/actions/mux-actions";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function POST() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const upload = await createMuxUploadUrl("*");
    return NextResponse.json(upload);
  } catch (error) {
    return handleApiError(error);
  }
}
