import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, requireRole, handleApiError } from "@/lib/api-helpers";
import { getPlatformFeePercent, setPlatformFeePercent } from "@/lib/platform-fee";
import { recordAuditLog } from "@/lib/audit-log";

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
    const previous = await getPlatformFeePercent();
    const body = putSchema.parse(await req.json());
    const platformFeePercent = await setPlatformFeePercent(body.platformFeePercent);
    await recordAuditLog({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "platform_fee.change",
      targetType: "setting",
      metadata: { from: previous, to: platformFeePercent },
      req,
    });
    return NextResponse.json({ platformFeePercent });
  } catch (error) {
    return handleApiError(error);
  }
}
