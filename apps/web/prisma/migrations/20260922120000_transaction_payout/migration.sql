-- Pagos a instructores. Hasta ahora cada cobro entraba completo a la cuenta de
-- Stripe de Cursumi y el reparto solo se anotaba en Transaction: nadie sabía
-- qué se había pagado ya. A partir de aquí cada transacción lleva el estado de
-- la parte del instructor.

CREATE TYPE "PayoutStatus" AS ENUM ('none', 'pending', 'transferred', 'automatic');

ALTER TABLE "Transaction"
  ADD COLUMN "payoutStatus"     "PayoutStatus" NOT NULL DEFAULT 'none',
  ADD COLUMN "stripeTransferId" TEXT,
  ADD COLUMN "paidOutAt"        TIMESTAMP(3),
  ADD COLUMN "payoutNote"       TEXT;

-- Todo lo cobrado hasta hoy con parte para el instructor sigue en la cuenta de
-- Cursumi: queda pendiente de transferir. El admin lo va marcando desde
-- /admin/payouts.
UPDATE "Transaction"
SET "payoutStatus" = 'pending'
WHERE "status" = 'completed' AND COALESCE("instructorAmount", 0) > 0;

CREATE INDEX "Transaction_payoutStatus_idx" ON "Transaction"("payoutStatus");
