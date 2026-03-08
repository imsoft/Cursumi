import Stripe from "stripe";

// Lazy singleton — only instantiates at runtime, not at build time
let _stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY no está configurada");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _stripe = new Stripe(key, {} as any);
  }
  return _stripe;
}

// Proxy so callers can `stripe.checkout.sessions.create(...)` etc.
export const stripe = new Proxy({} as Stripe, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_target, prop: string) {
    return (getStripeInstance() as any)[prop];
  },
});

export const PLATFORM_FEE_PERCENT = 15; // 15% de comisión de la plataforma

export function calculateSplit(amountCents: number) {
  const platformFee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  const instructorAmount = amountCents - platformFee;
  return { platformFee, instructorAmount };
}
