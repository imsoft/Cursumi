import { NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { ensureReferralCode, getReferralStats } from "@/lib/referral";

export async function GET() {
  try {
    const session = await requireSession();
    const code = await ensureReferralCode(session.user.id);
    const stats = await getReferralStats(session.user.id);

    const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cursumi.com").replace(/\/$/, "");
    return NextResponse.json({
      ...stats,
      referralCode: code,
      referralLink: `${siteUrl}/signup?ref=${code}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
