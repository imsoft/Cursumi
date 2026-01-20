import { NextResponse } from "next/server";
import { createMuxUploadUrl } from "@/app/actions/mux-actions";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function POST() {
  try {
    await requireSession();
    const upload = await createMuxUploadUrl("*");
    return NextResponse.json(upload);
  } catch (error) {
    return handleApiError(error);
  }
}
