-- Agrega el estado 'pending' a OrgSubscriptionStatus (cotización provisionada,
-- esperando pago). Se hace en una migración aparte porque Postgres no permite
-- usar un valor de enum recién agregado dentro de la misma transacción.
ALTER TYPE "OrgSubscriptionStatus" ADD VALUE IF NOT EXISTS 'pending' BEFORE 'active';
