import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";
import { PayoutError, markPayoutPaid, transferPayout } from "@/lib/payouts";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("transfer") }),
  z.object({ action: z.literal("mark-paid"), note: z.string().max(300).optional() }),
]);

// POST /api/admin/payouts/[id] — transfiere por Stripe Connect o registra un pago manual.
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["admin"]);

    // Mueve dinero: tope por si una sesión de admin queda expuesta.
    const limited = await checkRateLimitAsync({ key: `payouts:${session.user.id}`, limit: 30, windowSecs: 3600 });
    if (limited) return limited;

    const { id } = await context.params;
    const body = bodySchema.parse(await req.json());

    if (body.action === "transfer") {
      const result = await transferPayout(id);
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "payout.transfer",
          actorEmail: session.user.email ?? null,
          targetType: "transaction",
          targetId: id,
          metadata: { transferId: result.transferId, cents: result.cents },
        },
      }).catch(() => {});
      return NextResponse.json({ ok: true, ...result });
    }

    await markPayoutPaid(id, body.note ?? "");
    await prisma.auditLog.create({
      data: { actorId: session.user.id, actorEmail: session.user.email ?? null, action: "payout.mark-paid", targetType: "transaction", targetId: id, metadata: { note: body.note ?? "" } },
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PayoutError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe: ${error.message}` }, { status: 502 });
    }
    return handleApiError(error);
  }
}
