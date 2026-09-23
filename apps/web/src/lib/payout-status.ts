/**
 * Helpers puros del estado de pago al instructor. Sin Prisma ni Stripe a
 * propósito: este módulo se importa desde componentes de cliente, y
 * `lib/payouts.ts` (que sí carga la base y Stripe) tumbaba la página de
 * ingresos al cargarse en el navegador.
 */
import type { PayoutStatus } from "@/generated/prisma";

export type { PayoutStatus };

/** Perfil mínimo para decidir si el reparto puede hacerse en el propio cobro. */
export type ConnectProfile = { stripeAccountId: string | null; stripeOnboarded: boolean } | null | undefined;

/** Solo con cuenta creada Y onboarding completo: si no, Stripe rechaza el transfer. */
export function canSplitAtCheckout(profile: ConnectProfile): profile is { stripeAccountId: string; stripeOnboarded: true } {
  return Boolean(profile?.stripeAccountId && profile.stripeOnboarded);
}

/** Estado con el que nace una transacción según cómo se cobró. */
export function initialPayoutStatus(input: { instructorAmount: number; splitAtCheckout: boolean }): PayoutStatus {
  if (input.instructorAmount <= 0) return "none";
  return input.splitAtCheckout ? "automatic" : "pending";
}

/** Texto para el instructor y el admin. */
export function payoutLabel(status: PayoutStatus, paidOutAt?: Date | string | null): string {
  switch (status) {
    case "automatic":
      return "Depositado por Stripe al cobrar";
    case "transferred":
      return paidOutAt ? `Transferido el ${formatDate(paidOutAt)}` : "Transferido";
    case "pending":
      return "Pendiente de transferencia";
    default:
      return "Sin pago (importe $0)";
  }
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Mexico_City" });
}
