-- Modalidad "live" (clases en vivo con enlace) y enlace de reunión por sesión
ALTER TYPE "Modality" ADD VALUE IF NOT EXISTS 'live';

ALTER TABLE "CourseSession" ADD COLUMN IF NOT EXISTS "meetingUrl" TEXT;
