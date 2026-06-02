import { NextRequest, NextResponse } from "next/server";
import { getMuxPlaybackId } from "@/app/actions/mux-actions";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ uploadId: string }> }) {
  try {
    const { uploadId } = await context.params;
    await requireSession();
    const playback = await getMuxPlaybackId(uploadId);
    return NextResponse.json(playback);
  } catch (error) {
    return handleApiError(error);
  }
}
