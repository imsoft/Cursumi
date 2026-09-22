import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";

vi.mock("@/lib/stripe", () => ({ stripe: { paymentIntents: { retrieve: vi.fn() } } }));

const { stripeFeeFromPaymentIntent, fetchStripeFee } = await import("@/lib/stripe-fee");
const { stripe } = await import("@/lib/stripe");

const pi = (latest_charge: unknown) => ({ latest_charge }) as unknown as Stripe.PaymentIntent;

describe("stripeFeeFromPaymentIntent", () => {
  it("lee fee del balance_transaction expandido (venta de $180: $11 de Stripe)", () => {
    expect(stripeFeeFromPaymentIntent(pi({ balance_transaction: { fee: 1100, amount: 18000 } }))).toBe(1100);
  });

  it("null si el cargo o el balance_transaction vienen sin expandir", () => {
    expect(stripeFeeFromPaymentIntent(pi(null))).toBeNull();
    expect(stripeFeeFromPaymentIntent(pi("ch_1"))).toBeNull();
    expect(stripeFeeFromPaymentIntent(pi({ balance_transaction: "txn_1" }))).toBeNull();
    expect(stripeFeeFromPaymentIntent(pi({ balance_transaction: null }))).toBeNull();
  });
});

describe("fetchStripeFee", () => {
  it("expande el balance_transaction y no revienta si Stripe falla", async () => {
    const retrieve = vi.mocked(stripe.paymentIntents.retrieve);
    retrieve.mockResolvedValueOnce(pi({ balance_transaction: { fee: 1100 } }) as never);
    expect(await fetchStripeFee("pi_1")).toBe(1100);
    expect(retrieve.mock.calls[0][1]).toEqual({ expand: ["latest_charge.balance_transaction"] });
    retrieve.mockRejectedValueOnce(new Error("boom"));
    expect(await fetchStripeFee("pi_1")).toBeNull();
  });
});
