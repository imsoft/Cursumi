import { describe, it, expect, vi, beforeEach } from "vitest";

const tx: Record<string, unknown> = {};
const updates: unknown[] = [];
const transfers: unknown[] = [];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findUnique: vi.fn(async () => tx.current ?? null),
      findMany: vi.fn(async () => tx.list ?? []),
      update: vi.fn(async (args: unknown) => { updates.push(args); return {}; }),
    },
  },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    transfers: {
      create: vi.fn(async (params: unknown, opts: unknown) => { transfers.push({ params, opts }); return { id: "tr_123" }; }),
    },
  },
}));

const { canSplitAtCheckout, initialPayoutStatus, payoutLabel, transferPayout, markPayoutPaid, listPendingPayouts } = await import("@/lib/payouts");

beforeEach(() => {
  delete tx.current;
  delete tx.list;
  updates.length = 0;
  transfers.length = 0;
});

describe("reparto al cobrar", () => {
  it("solo con cuenta creada y onboarding completo", () => {
    expect(canSplitAtCheckout(null)).toBe(false);
    expect(canSplitAtCheckout({ stripeAccountId: null, stripeOnboarded: false })).toBe(false);
    expect(canSplitAtCheckout({ stripeAccountId: "acct_1", stripeOnboarded: false })).toBe(false);
    expect(canSplitAtCheckout({ stripeAccountId: "acct_1", stripeOnboarded: true })).toBe(true);
  });

  it("estado inicial según importe y si hubo reparto", () => {
    expect(initialPayoutStatus({ instructorAmount: 0, splitAtCheckout: true })).toBe("none");
    expect(initialPayoutStatus({ instructorAmount: 15300, splitAtCheckout: true })).toBe("automatic");
    expect(initialPayoutStatus({ instructorAmount: 15300, splitAtCheckout: false })).toBe("pending");
  });

  it("etiquetas para el instructor", () => {
    expect(payoutLabel("automatic")).toMatch(/Depositado/);
    expect(payoutLabel("pending")).toMatch(/Pendiente/);
    expect(payoutLabel("transferred", "2026-09-22T12:00:00Z")).toMatch(/Transferido el 22 sept? 2026/);
    expect(payoutLabel("none")).toMatch(/\$0/);
  });
});

describe("transferPayout", () => {
  const pendiente = {
    id: "t1", status: "completed", payoutStatus: "pending", instructorAmount: 15300, currency: "MXN", stripePaymentId: "pi_1",
    course: { instructor: { instructorProfile: { stripeAccountId: "acct_1", stripeOnboarded: true } } },
  };

  it("crea el transfer por la parte del instructor y lo marca transferido", async () => {
    tx.current = pendiente;
    const r = await transferPayout("t1");
    expect(r).toEqual({ transferId: "tr_123", cents: 15300 });
    const call = transfers[0] as { params: Record<string, unknown>; opts: Record<string, unknown> };
    expect(call.params.amount).toBe(15300);
    expect(call.params.currency).toBe("mxn");
    expect(call.params.destination).toBe("acct_1");
    // Idempotente: la clave es la transacción, no el clic.
    expect(call.opts.idempotencyKey).toBe("payout-t1");
    const upd = updates[0] as { data: Record<string, unknown> };
    expect(upd.data.payoutStatus).toBe("transferred");
    expect(upd.data.stripeTransferId).toBe("tr_123");
  });

  it("rechaza pagar dos veces o sin Stripe", async () => {
    tx.current = { ...pendiente, payoutStatus: "transferred" };
    await expect(transferPayout("t1")).rejects.toThrow(/ya no está pendiente/);
    tx.current = { ...pendiente, course: { instructor: { instructorProfile: { stripeAccountId: "acct_1", stripeOnboarded: false } } } };
    await expect(transferPayout("t1")).rejects.toThrow(/Stripe/);
    tx.current = { ...pendiente, status: "refunded" };
    await expect(transferPayout("t1")).rejects.toThrow(/cobradas/);
    expect(transfers).toHaveLength(0);
  });

  it("marcar pagado a mano guarda la nota y no toca Stripe", async () => {
    tx.current = { status: "completed", payoutStatus: "pending" };
    await markPayoutPaid("t1", "  SPEI folio 99  ");
    const upd = updates[0] as { data: Record<string, unknown> };
    expect(upd.data.payoutStatus).toBe("transferred");
    expect(upd.data.payoutNote).toBe("SPEI folio 99");
    expect(transfers).toHaveLength(0);
  });
});

describe("listPendingPayouts", () => {
  it("agrupa por instructor y suma su parte", async () => {
    const row = (id: string, inst: string, cents: number) => ({
      id, amount: cents * 2, instructorAmount: cents, createdAt: new Date("2026-09-01"),
      user: { name: "Alumno" },
      course: { title: "Curso", instructor: { id: inst, name: `Inst ${inst}`, email: `${inst}@x.com`, instructorProfile: { stripeAccountId: inst === "a" ? "acct_a" : null, stripeOnboarded: inst === "a" } } },
    });
    tx.list = [row("1", "a", 100), row("2", "b", 500), row("3", "a", 300)];
    const groups = await listPendingPayouts();
    expect(groups.map((g) => g.instructorId)).toEqual(["b", "a"]); // mayor deuda primero
    expect(groups[1].pendingCents).toBe(400);
    expect(groups[1].stripeOnboarded).toBe(true);
    expect(groups[0].rows).toHaveLength(1);
  });
});
