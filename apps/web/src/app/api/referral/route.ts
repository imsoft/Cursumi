import { NextRequest, NextResponse } from "next/server";
import { resolveReferralCode } from "@/lib/referral";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";

// GET /api/referral?code=ABC12345 — validar código sin autenticación
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimitAsync({ key: `referral:${ip}`, limit: 20, windowSecs: 60 });
  if (rl) return rl;

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const referrer = await resolveReferralCode(code).catch(() => null);
  if (!referrer) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    referrerName: referrer.name?.split(" ")[0] ?? "un amigo",
  });
}
