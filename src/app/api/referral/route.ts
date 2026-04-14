import { NextRequest, NextResponse } from "next/server";
import { resolveReferralCode } from "@/lib/referral";

// GET /api/referral?code=ABC12345 — validar código sin autenticación
export async function GET(req: NextRequest) {
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
