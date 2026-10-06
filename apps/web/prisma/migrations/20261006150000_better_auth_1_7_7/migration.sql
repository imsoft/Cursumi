-- better-auth 1.7.7 (PR de Dependabot). Desde 1.7.3 valida el esquema en
-- cada petición de /api/auth y rechaza TODO el login si falta una columna.
--
-- 1) El plugin de 2FA ahora lleva contador de intentos fallidos y bloqueo.
ALTER TABLE "TwoFactor"
  ADD COLUMN "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);

-- 2) `issuer` lo introdujo 1.7.0-1.7.2 y 1.7.3 lo retiró: better-auth ya no lo
--    escribe, así que con NOT NULL cada cuenta nueva (registro por correo o
--    Google) fallaría. Guía oficial de 1.7: quitar NOT NULL y el índice único
--    (el índice antes que nada, como pide la guía). La columna se conserva.
DROP INDEX IF EXISTS "Account_issuer_accountId_key";
ALTER TABLE "Account" ALTER COLUMN "issuer" DROP NOT NULL;
