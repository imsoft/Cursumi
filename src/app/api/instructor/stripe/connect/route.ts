import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function POST() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
      select: { stripeAccountId: true, stripeOnboarded: true },
    });

    // Ya conectado → abrir dashboard propio del instructor en Stripe
    if (profile?.stripeOnboarded && profile.stripeAccountId) {
      return NextResponse.json({ url: "https://dashboard.stripe.com" });
    }

    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Stripe Connect no está configurado en el servidor (falta STRIPE_CONNECT_CLIENT_ID)." },
        { status: 500 },
      );
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      redirect_uri: `${origin}/api/instructor/stripe/callback`,
      state: session.user.id,
    });

    return NextResponse.json({ url: `https://connect.stripe.com/oauth/authorize?${params}` });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);

    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
      select: { stripeAccountId: true, stripeOnboarded: true },
    });

    if (!profile?.stripeAccountId) {
      return NextResponse.json({ connected: false, onboarded: false });
    }

    // Para Standard Connect verificamos el estado de la cuenta conectada
    const account = await stripe.accounts.retrieve(profile.stripeAccountId);
    const onboarded = Boolean(account.details_submitted && account.charges_enabled);

    if (onboarded && !profile.stripeOnboarded) {
      await prisma.instructorProfile.update({
        where: { userId: session.user.id },
        data: { stripeOnboarded: true },
      });
    }

    return NextResponse.json({ connected: true, onboarded });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error:", error.message);
      return NextResponse.json({ connected: false, onboarded: false });
    }
    return handleApiError(error);
  }
}
