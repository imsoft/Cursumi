import Stripe from "stripe";
import { DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/platform-fee";

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

/** @deprecated Usar `getPlatformFeePercent()`; se mantiene el default para referencia */
export const PLATFORM_FEE_PERCENT = DEFAULT_PLATFORM_FEE_PERCENT;

/**
 * Reparto plataforma / instructor sobre el monto cobrado (centavos).
 * `platformFeePercent` entre 0 y 100 (configurable en admin).
 */
export function calculateSplit(amountCents: number, platformFeePercent: number) {
  const pct = Math.min(100, Math.max(0, Math.round(platformFeePercent)));
  const platformFee = Math.round(amountCents * (pct / 100));
  const instructorAmount = amountCents - platformFee;
  return { platformFee, instructorAmount };
}
