-- CreateEnum
CREATE TYPE "RegimenFiscal" AS ENUM ('actividad_empresarial', 'resico', 'persona_moral');

-- AlterTable
-- Nullable a propósito: quien ya es instructor no lo ha declarado todavía.
ALTER TABLE "InstructorProfile" ADD COLUMN "regimenFiscal" "RegimenFiscal";
