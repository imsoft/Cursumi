import type Stripe from "stripe";
import { stripe } from "./stripe";

/**
 * Comisión que Stripe descontó de un pago, en centavos.
 *
 * Vive en el balance_transaction del cargo, no en el PaymentIntent ni en la
 * sesión de checkout, así que hay que expandirlo. Con cargos con destino
 * (Connect) la comisión se descuenta de la parte de Cursumi, que es lo que
 * aquí interesa. Devuelve null si el cargo aún no tiene balance_transaction.
 */
export function stripeFeeFromPaymentIntent(pi: Stripe.PaymentIntent): number | null {
  const charge = pi.latest_charge;
  if (!charge || typeof charge === "string") return null;
  const bt = charge.balance_transaction;
  if (!bt || typeof bt === "string") return null;
  return typeof bt.fee === "number" ? bt.fee : null;
}

/** Consulta Stripe por el PaymentIntent y devuelve su comisión, o null si no se pudo. */
export async function fetchStripeFee(paymentIntentId: string): Promise<number | null> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge.balance_transaction"],
    });
    return stripeFeeFromPaymentIntent(pi);
  } catch (err) {
    console.warn(`[pagos] No se pudo leer la comisión de Stripe de ${paymentIntentId}:`, err);
    return null;
  }
}
