import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";
import { getPlatformFeePercent, setPlatformFeePercent } from "@/lib/platform-fee";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const platformFeePercent = await getPlatformFeePercent();
    return NextResponse.json({ platformFeePercent });
  } catch (error) {
    return handleApiError(error);
  }
}

const putSchema = z.object({
  platformFeePercent: z.number().min(0).max(100),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);
    const body = putSchema.parse(await req.json());
    const platformFeePercent = await setPlatformFeePercent(body.platformFeePercent);
    return NextResponse.json({ platformFeePercent });
  } catch (error) {
    return handleApiError(error);
  }
}
