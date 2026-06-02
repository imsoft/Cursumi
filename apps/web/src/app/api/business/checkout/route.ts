import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";
import { checkRateLimitAsync } from "@/lib/rate-limit";

/**
 * Inicia el pago de la suscripción empresarial cotizada. El monto y el intervalo
 * los fijó el admin al provisionar la organización (estado `pending`); aquí se crea
 * un Stripe Checkout con ese precio dinámico. El webhook (customer.subscription.*)
 * activa la suscripción al confirmarse el pago.
 */
export async function POST() {
  try {
    const session = await requireSession();

    const limited = await checkRateLimitAsync({
      key: `business-checkout:${session.user.id}`,
      limit: 5,
      windowSecs: 3600,
    });
    if (limited) return limited;

    const { org } = await resolveOrgAdmin(session.user.id);

    const sub = await prisma.orgSubscription.findUnique({
      where: { organizationId: org.id },
    });

    if (!sub || sub.amountCents == null || !sub.billingInterval) {
      return NextResponse.json(
        { error: "Tu organización aún no tiene una cotización lista. Contáctanos." },
        { status: 400 }
      );
    }

    if (sub.status === "active") {
      return NextResponse.json(
        { error: "Tu suscripción ya está activa." },
        { status: 409 }
      );
    }

    const interval = sub.billingInterval === "year" ? "year" : "month";

    // Reusar el customer de Stripe si ya existe; si no, crearlo y guardarlo en la
    // suscripción para que el webhook (que busca por stripeCustomerId) la enlace.
    let stripeCustomerId = sub.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: org.contactEmail,
        name: org.name,
        metadata: { organizationId: org.id },
      });
      stripeCustomerId = customer.id;
      await prisma.orgSubscription.update({
        where: { organizationId: org.id },
        data: { stripeCustomerId },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: { name: `Cursumi Business — ${org.name}` },
            unit_amount: sub.amountCents,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/business/dashboard/subscription?activated=true`,
      cancel_url: `${baseUrl}/business/dashboard/subscription`,
      metadata: { organizationId: org.id },
      subscription_data: {
        metadata: { organizationId: org.id, maxSeats: String(sub.maxSeats) },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return handleApiError(error);
  }
}
