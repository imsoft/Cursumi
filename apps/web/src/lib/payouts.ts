/**
 * Pagos a instructores.
 *
 * Cómo se mueve el dinero de una venta:
 *
 * 1. Si el instructor tiene Stripe Connect con el onboarding completo, el
 *    checkout se crea con `transfer_data.destination` + `application_fee_amount`:
 *    Stripe le manda su parte al cobrar y Cursumi se queda con la comisión.
 *    La transacción nace con `payoutStatus = automatic`.
 * 2. Si no lo tiene, el cobro entra completo a la cuenta de Cursumi y la
 *    transacción queda `pending`. Cuando el instructor conecta Stripe, el
 *    admin la transfiere desde /admin/payouts (`stripe.transfers.create`), o la
 *    marca como pagada a mano si le hizo SPEI.
 *
 * La comisión de Stripe la absorbe Cursumi en los dos casos: el instructor
 * recibe exactamente `instructorAmount`.
 */
import { prisma } from "./prisma";
import { stripe } from "./stripe";
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

export type PendingPayoutRow = {
  transactionId: string;
  createdAt: string;
  courseTitle: string;
  studentName: string;
  amountCents: number;
  instructorAmountCents: number;
};

export type InstructorPayoutGroup = {
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  pendingCents: number;
  rows: PendingPayoutRow[];
};

/** Transacciones cobradas cuya parte del instructor sigue en la cuenta de Cursumi, agrupadas por instructor. */
export async function listPendingPayouts(): Promise<InstructorPayoutGroup[]> {
  const rows = await prisma.transaction.findMany({
    where: { status: "completed", payoutStatus: "pending" },
    select: {
      id: true,
      amount: true,
      instructorAmount: true,
      createdAt: true,
      user: { select: { name: true } },
      course: {
        select: {
          title: true,
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              instructorProfile: { select: { stripeAccountId: true, stripeOnboarded: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, InstructorPayoutGroup>();
  for (const t of rows) {
    const inst = t.course.instructor;
    const g = groups.get(inst.id) ?? {
      instructorId: inst.id,
      instructorName: inst.name ?? "Instructor",
      instructorEmail: inst.email ?? "",
      stripeAccountId: inst.instructorProfile?.stripeAccountId ?? null,
      stripeOnboarded: inst.instructorProfile?.stripeOnboarded ?? false,
      pendingCents: 0,
      rows: [],
    };
    const cents = t.instructorAmount ?? 0;
    g.pendingCents += cents;
    g.rows.push({
      transactionId: t.id,
      createdAt: t.createdAt.toISOString(),
      courseTitle: t.course.title,
      studentName: t.user.name ?? "Alumno",
      amountCents: t.amount,
      instructorAmountCents: cents,
    });
    groups.set(inst.id, g);
  }
  return [...groups.values()].sort((a, b) => b.pendingCents - a.pendingCents);
}

export class PayoutError extends Error {}

/**
 * Transfiere la parte del instructor por Stripe Connect. Idempotente por
 * transacción: repetir la llamada no duplica el envío.
 */
export async function transferPayout(transactionId: string): Promise<{ transferId: string; cents: number }> {
  const t = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      status: true,
      payoutStatus: true,
      instructorAmount: true,
      currency: true,
      stripePaymentId: true,
      course: { select: { instructor: { select: { instructorProfile: { select: { stripeAccountId: true, stripeOnboarded: true } } } } } },
    },
  });
  if (!t) throw new PayoutError("Transacción no encontrada.");
  if (t.status !== "completed") throw new PayoutError("Solo se pagan transacciones cobradas.");
  if (t.payoutStatus !== "pending") throw new PayoutError("Esta transacción ya no está pendiente de pago.");
  const cents = t.instructorAmount ?? 0;
  if (cents <= 0) throw new PayoutError("No hay importe que transferir.");
  const profile = t.course.instructor.instructorProfile;
  if (!canSplitAtCheckout(profile)) throw new PayoutError("El instructor aún no completa su cuenta de Stripe.");

  const transfer = await stripe.transfers.create(
    {
      amount: cents,
      currency: t.currency.toLowerCase(),
      destination: profile.stripeAccountId,
      transfer_group: t.id,
      metadata: { transactionId: t.id, paymentIntent: t.stripePaymentId ?? "" },
      description: `Cursumi · pago de curso (transacción ${t.id})`,
    },
    // Si el admin da doble clic o Vercel reintenta, Stripe devuelve el mismo transfer.
    { idempotencyKey: `payout-${t.id}` },
  );

  await prisma.transaction.update({
    where: { id: t.id },
    data: { payoutStatus: "transferred", stripeTransferId: transfer.id, paidOutAt: new Date() },
  });
  return { transferId: transfer.id, cents };
}

/** El admin pagó por fuera de Stripe (SPEI, efectivo): solo se registra. */
export async function markPayoutPaid(transactionId: string, note: string): Promise<void> {
  const t = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { status: true, payoutStatus: true },
  });
  if (!t) throw new PayoutError("Transacción no encontrada.");
  if (t.status !== "completed" || t.payoutStatus !== "pending") throw new PayoutError("Esta transacción no está pendiente de pago.");
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { payoutStatus: "transferred", paidOutAt: new Date(), payoutNote: note.trim().slice(0, 300) || "Pagado fuera de Stripe" },
  });
}
