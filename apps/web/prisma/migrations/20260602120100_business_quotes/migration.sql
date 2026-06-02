-- OrgSubscription: cotización a medida.
-- El admin provisiona la suscripción (monto e intervalo acordados) antes de que
-- exista un customer en Stripe, por eso stripeCustomerId pasa a ser opcional y el
-- estado por defecto es 'pending'.
ALTER TABLE "OrgSubscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL;
ALTER TABLE "OrgSubscription" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "OrgSubscription" ADD COLUMN "amountCents" INTEGER;
ALTER TABLE "OrgSubscription" ADD COLUMN "billingInterval" TEXT;
ALTER TABLE "OrgSubscription" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'MXN';

-- BusinessQuoteRequest: solicitudes públicas de cotización (leads).
CREATE TABLE "BusinessQuoteRequest" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "companySize" TEXT,
    "interests" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessQuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BusinessQuoteRequest_status_idx" ON "BusinessQuoteRequest"("status");
CREATE INDEX "BusinessQuoteRequest_createdAt_idx" ON "BusinessQuoteRequest"("createdAt");
