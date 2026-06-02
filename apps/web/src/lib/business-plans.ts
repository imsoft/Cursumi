/**
 * Planes de Cursumi Business.
 *
 * Los Price IDs son recurrentes (suscripción) y se configuran en el dashboard de
 * Stripe; aquí solo se referencian por variable de entorno para no acoplar montos
 * al código. Si un plan no tiene Price ID configurado, su checkout self-serve
 * queda deshabilitado y se cae a "contacto a ventas".
 *
 * Enterprise es siempre liderado por ventas (sin checkout).
 */

export type BusinessPlanId = "starter" | "business" | "enterprise";

export interface BusinessPlan {
  id: BusinessPlanId;
  name: string;
  maxSeats: number;
  /** Variable de entorno con el Price ID recurrente de Stripe. */
  priceEnvVar?: string;
  /** Si true, no hay checkout self-serve: se contacta a ventas. */
  salesLed: boolean;
}

export const BUSINESS_PLANS: Record<BusinessPlanId, BusinessPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    maxSeats: 10,
    priceEnvVar: "STRIPE_BUSINESS_STARTER_PRICE_ID",
    salesLed: false,
  },
  business: {
    id: "business",
    name: "Business",
    maxSeats: 50,
    priceEnvVar: "STRIPE_BUSINESS_BUSINESS_PRICE_ID",
    salesLed: false,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    maxSeats: 1_000_000, // efectivamente ilimitado
    salesLed: true,
  },
};

/** Devuelve el Price ID de Stripe configurado para un plan, o null si no aplica. */
export function getStripePriceId(plan: BusinessPlan): string | null {
  if (plan.salesLed || !plan.priceEnvVar) return null;
  return process.env[plan.priceEnvVar]?.trim() || null;
}

export function getPlan(id: string): BusinessPlan | null {
  return (BUSINESS_PLANS as Record<string, BusinessPlan>)[id] ?? null;
}
