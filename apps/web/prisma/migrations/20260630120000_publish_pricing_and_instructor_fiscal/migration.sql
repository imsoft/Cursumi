-- AlterTable: precio explícito gratuito para cursos
ALTER TABLE "Course" ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: cursos existentes con price 0 se consideran gratuitos
UPDATE "Course" SET "isFree" = true WHERE "price" = 0;

-- AlterTable: datos fiscales/identidad en la solicitud de instructor
ALTER TABLE "InstructorApplication" ADD COLUMN "legalName" TEXT;
ALTER TABLE "InstructorApplication" ADD COLUMN "rfc" TEXT;
ALTER TABLE "InstructorApplication" ADD COLUMN "fiscalAddress" TEXT;
