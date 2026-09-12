-- better-auth 1.7 añadió `issuer` a la tabla de cuentas y lo consulta en cada
-- inicio de sesión social. Sin la columna, el callback de Google fallaba con
-- PrismaClientValidationError y devolvía internal_server_error.

-- Se añaden como NULL para poder rellenar las filas que ya existen.
ALTER TABLE "Account" ADD COLUMN "issuer" TEXT;
ALTER TABLE "Account" ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);

-- Relleno con los mismos valores que better-auth generaría hoy.
UPDATE "Account" SET "issuer" = 'https://accounts.google.com' WHERE "providerId" = 'google';
UPDATE "Account" SET "issuer" = 'local:credential'            WHERE "providerId" = 'credential';
-- Cualquier otro proveedor usa el emisor sintético de better-auth.
UPDATE "Account" SET "issuer" = 'local:oauth:' || "providerId" WHERE "issuer" IS NULL;

-- Ya con todas las filas rellenas, pasa a obligatoria.
ALTER TABLE "Account" ALTER COLUMN "issuer" SET NOT NULL;

-- El índice único que declara el esquema nuevo.
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
