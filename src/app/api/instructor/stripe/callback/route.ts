import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !userId) {
    const reason = error ?? "missing_params";
    return NextResponse.redirect(`${origin}/instructor/earnings?connect=error&reason=${reason}`);
  }

  try {
    const response = await stripe.oauth.token({
      code,
      grant_type: "authorization_code",
    });

    const stripeAccountId = response.stripe_user_id;
    if (!stripeAccountId) {
      return NextResponse.redirect(`${origin}/instructor/earnings?connect=error&reason=no_account`);
    }

    await prisma.instructorProfile.upsert({
      where: { userId },
      update: { stripeAccountId, stripeOnboarded: true },
      create: { userId, stripeAccountId, stripeOnboarded: true },
    });

    return NextResponse.redirect(`${origin}/instructor/earnings?connect=success`);
  } catch (err) {
    console.error("Stripe OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/instructor/earnings?connect=error&reason=oauth_failed`);
  }
}
