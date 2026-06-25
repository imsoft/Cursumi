-- Consolida las 3 modalidades (virtual/presencial/live) en 2 tipos de curso:
--   virtual = Curso en video (on-demand)
--   evento  = Curso por evento (sesiones presenciales o por videollamada)
-- El formato presencial/online pasa a definirse POR SESIÓN (CourseSession.format).

-- 1. Nuevo enum de formato de sesión
CREATE TYPE "SessionFormat" AS ENUM ('presencial', 'online');

-- 2. Columna format en CourseSession (default presencial)
ALTER TABLE "CourseSession"
  ADD COLUMN "format" "SessionFormat" NOT NULL DEFAULT 'presencial';

-- 3. Derivar el formato ANTES de colapsar la modalidad del curso:
--    sesiones de cursos "live" (videollamada) -> online; el resto queda presencial.
UPDATE "CourseSession" cs
  SET "format" = 'online'
  FROM "Course" c
  WHERE cs."courseId" = c."id"
    AND c."modality" = 'live';

-- 4. Recrear el enum Modality como {virtual, evento}, mapeando presencial/live -> evento.
ALTER TYPE "Modality" RENAME TO "Modality_old";
CREATE TYPE "Modality" AS ENUM ('virtual', 'evento');

ALTER TABLE "Course"
  ALTER COLUMN "modality" TYPE "Modality"
  USING (
    CASE "modality"::text
      WHEN 'virtual' THEN 'virtual'
      ELSE 'evento'
    END
  )::"Modality";

DROP TYPE "Modality_old";
