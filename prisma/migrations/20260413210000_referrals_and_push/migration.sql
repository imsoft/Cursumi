-- ─── Nuevos enums ────────────────────────────────────────────────────────────

CREATE TYPE "ReferralStatus" AS ENUM ('pending', 'earned', 'paid');

-- ─── Referral fields en User ──────────────────────────────────────────────────

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "referralCode"  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "referredById"  TEXT;

-- Generar códigos para usuarios existentes (8 chars hex aleatorio)
UPDATE "User"
SET "referralCode" = substring(md5(id || now()::text), 1, 8)
WHERE "referralCode" IS NULL;

-- Foreign key referredById → User.id
ALTER TABLE "User"
  ADD CONSTRAINT "User_referredById_fkey"
    FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL
    NOT VALID;

ALTER TABLE "User" VALIDATE CONSTRAINT "User_referredById_fkey";

-- ─── Modelo Referral ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Referral" (
  "id"               TEXT         NOT NULL,
  "referrerId"       TEXT         NOT NULL,
  "referredUserId"   TEXT         NOT NULL,
  "transactionId"    TEXT,
  "commissionAmount" INTEGER,
  "status"           "ReferralStatus" NOT NULL DEFAULT 'pending',
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Referral_referredUserId_key" UNIQUE ("referredUserId"),
  CONSTRAINT "Referral_referrerId_fkey"
    FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Referral_referredUserId_fkey"
    FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Referral_transactionId_key" UNIQUE ("transactionId"),
  CONSTRAINT "Referral_transactionId_fkey"
    FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx"  ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_status_idx"      ON "Referral"("status");

-- ─── Modelo PushSubscription ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id"        TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "endpoint"  TEXT         NOT NULL,
  "keys"      JSONB        NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PushSubscription_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "PushSubscription_endpoint_key" UNIQUE ("endpoint"),
  CONSTRAINT "PushSubscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");
