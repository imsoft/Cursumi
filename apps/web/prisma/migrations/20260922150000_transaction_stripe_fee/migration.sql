-- Comisión de Stripe por pago. Hasta ahora el admin veía "Comisión plataforma"
-- pero no lo que Stripe descuenta de ella, así que el neto real de Cursumi
-- solo existía en el dashboard de Stripe. Se guarda en centavos; las ventas
-- anteriores quedan en NULL hasta correr scripts/backfill-stripe-fee.ts.
ALTER TABLE "Transaction" ADD COLUMN "stripeFee" INTEGER;
