import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { handleApiError, requireSession } from "@/lib/api-helpers";
import { resolveOrgAdmin } from "@/lib/org-service";
import { getPlan, getStripePriceId } from "@/lib/business-plans";
import { checkRateLimitAsync } from "@/lib/rate-limit";

const bodySchema = z.object({
  plan: z.enum(["starter", "business"]),
});

/**
 * Crea una sesión de Stripe Checkout (modo suscripción) para que el dueño de una
 * organización active/cambie su plan de Cursumi Business. El webhook de pagos
 * (customer.subscription.created) enlaza la OrgSubscription vía
 * subscription_data.metadata.organizationId y fija maxSeats desde el metadata.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const limited = await checkRateLimitAsync({
      key: `business-checkout:${session.user.id}`,
      limit: 5,
      windowSecs: 3600,
    });
    if (limited) return limited;

    const { plan: planId } = bodySchema.parse(await req.json());

    // Debe ser owner/admin de una organización.
    const { org } = await resolveOrgAdmin(session.user.id);

    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
    }

    const priceId = getStripePriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Este plan no está disponible para contratación en línea. Contáctanos para activarlo.",
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Reutilizar el customer de Stripe si la org ya tuvo una suscripción.
    const existingSub = await prisma.orgSubscription.findUnique({
      where: { organizationId: org.id },
      select: { stripeCustomerId: true },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existingSub?.stripeCustomerId
        ? { customer: existingSub.stripeCustomerId }
        : { customer_email: org.contactEmail }),
      success_url: `${baseUrl}/business/dashboard/subscription?activated=true`,
      cancel_url: `${baseUrl}/business/dashboard/subscription`,
      // metadata de la sesión (referencia) + de la suscripción (la lee el webhook)
      metadata: { organizationId: org.id, plan: plan.id },
      subscription_data: {
        metadata: {
          organizationId: org.id,
          plan: plan.id,
          maxSeats: String(plan.maxSeats),
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return handleApiError(error);
  }
}
