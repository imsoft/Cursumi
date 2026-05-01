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

    // Ya completó el onboarding → abrir su Express dashboard
    if (profile?.stripeOnboarded && profile.stripeAccountId) {
      const loginLink = await stripe.accounts.createLoginLink(profile.stripeAccountId);
      return NextResponse.json({ url: loginLink.url });
    }

    // Crear cuenta Express si no existe aún
    let accountId = profile?.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express" });
      accountId = account.id;

      await prisma.instructorProfile.upsert({
        where: { userId: session.user.id },
        update: { stripeAccountId: accountId },
        create: { userId: session.user.id, stripeAccountId: accountId },
      });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/instructor/earnings?connect=refresh`,
      return_url: `${origin}/instructor/earnings?connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe Express error:", error.message, (error as Stripe.errors.StripeError).code);
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
      console.error("Stripe GET error:", error.message);
      return NextResponse.json({ connected: false, onboarded: false });
    }
    return handleApiError(error);
  }
}
