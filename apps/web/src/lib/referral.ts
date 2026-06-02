/**
 * Sistema de referidos de Cursumi.
 *
 * Flujo:
 *  1. Cada usuario tiene un `referralCode` de 8 caracteres (generado al crear cuenta).
 *  2. Un nuevo usuario llega a /signup?ref=CODE → guardamos el código en cookie.
 *  3. Al completar el registro, vinculamos referredById y creamos un Referral (status=pending).
 *  4. Cuando el referido completa su primera compra (webhook Stripe), la comisión pasa a earned.
 *
 * Comisión: 10 % del monto neto de la transacción (monto - platformFee).
 */
import { prisma } from "./prisma";

const CODE_LENGTH = 8;
const COMMISSION_RATE = 0.10; // 10 %

// ─── Generación de código ─────────────────────────────────────────────────────

export function generateReferralCode(): string {
  // 8 chars alfanuméricos en mayúsculas, sin caracteres ambiguos
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const arr = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += chars[byte % chars.length];
  }
  return code;
}

/**
 * Obtiene o genera el referralCode del usuario.
 * Se llama una sola vez durante el registro.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  // Generar un código único
  let code = generateReferralCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!existing) break;
    code = generateReferralCode();
    attempts++;
  }

  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

// ─── Resolución de código ─────────────────────────────────────────────────────

export async function resolveReferralCode(code: string) {
  if (!code || code.length !== CODE_LENGTH) return null;
  return prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { id: true, name: true, referralCode: true },
  });
}

// ─── Registro con referido ────────────────────────────────────────────────────

/**
 * Llamar después del registro exitoso si venía con un código de referido.
 * Crea el Referral en estado pending y vincula referredById en User.
 */
export async function applyReferral(referredUserId: string, referralCode: string): Promise<void> {
  const referrer = await resolveReferralCode(referralCode);
  if (!referrer || referrer.id === referredUserId) return; // no auto-referidos

  // Verificar que no tenga ya un referido aplicado
  const already = await prisma.referral.findUnique({
    where: { referredUserId },
    select: { id: true },
  });
  if (already) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referredUserId },
      data: { referredById: referrer.id },
    }),
    prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredUserId,
        status: "pending",
      },
    }),
  ]);
}

// ─── Comisión al completar compra ────────────────────────────────────────────

/**
 * Llamar desde el webhook de Stripe cuando una transacción pasa a completed.
 * Calcula la comisión y actualiza el Referral a earned.
 */
export async function processReferralCommission(transactionId: string): Promise<void> {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { userId: true, amount: true, platformFee: true, status: true },
  });

  if (!tx || tx.status !== "completed") return;

  // Buscar si el comprador fue referido
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: tx.userId },
    select: { id: true, status: true },
  });

  if (!referral || referral.status !== "pending") return;

  const net = tx.amount - (tx.platformFee ?? 0);
  const commission = Math.round(net * COMMISSION_RATE);

  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      transactionId,
      commissionAmount: commission,
      status: "earned",
    },
  });
}

// ─── Estadísticas del referidor ───────────────────────────────────────────────

export async function getReferralStats(userId: string) {
  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        status: true,
        commissionAmount: true,
        createdAt: true,
        referredUser: { select: { name: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalEarned = referrals
    .filter((r) => r.status === "earned" || r.status === "paid")
    .reduce((sum, r) => sum + (r.commissionAmount ?? 0), 0);

  const totalPaid = referrals
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + (r.commissionAmount ?? 0), 0);

  return {
    referralCode: user?.referralCode ?? null,
    totalReferrals: referrals.length,
    pendingReferrals: referrals.filter((r) => r.status === "pending").length,
    earnedReferrals: referrals.filter((r) => r.status === "earned" || r.status === "paid").length,
    totalEarnedCents: totalEarned,
    totalPaidCents: totalPaid,
    pendingPayoutCents: totalEarned - totalPaid,
    referrals: referrals.map((r) => ({
      id: r.id,
      status: r.status,
      commissionAmount: r.commissionAmount,
      createdAt: r.createdAt.toISOString(),
      referredName: r.referredUser.name ?? "Usuario",
      referredAt: r.referredUser.createdAt.toISOString(),
    })),
  };
}
