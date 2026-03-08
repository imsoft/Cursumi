import { NextResponse } from "next/server";
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

    // Si ya está conectado, redirigir al dashboard de Stripe
    if (profile?.stripeOnboarded && profile.stripeAccountId) {
      const loginLink = await stripe.accounts.createLoginLink(profile.stripeAccountId);
      return NextResponse.json({ url: loginLink.url });
    }

    // Crear o reusar account de Stripe Connect
    let accountId = profile?.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "MX",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
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

    // Verificar estado actual en Stripe
    const account = await stripe.accounts.retrieve(profile.stripeAccountId);
    const onboarded = account.details_submitted && account.charges_enabled;

    // Actualizar DB si cambió
    if (onboarded && !profile.stripeOnboarded) {
      await prisma.instructorProfile.update({
        where: { userId: session.user.id },
        data: { stripeOnboarded: true },
      });
    }

    return NextResponse.json({ connected: true, onboarded });
  } catch (error) {
    return handleApiError(error);
  }
}
