-- Código de inscripción (hash) para cursos presenciales gratuitos
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "joinCodeHash" TEXT;
