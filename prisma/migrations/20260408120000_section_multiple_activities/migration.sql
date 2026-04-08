-- AlterTable
ALTER TABLE "CourseSection" ADD COLUMN IF NOT EXISTS "activities" JSONB;

-- AlterTable: submissions por actividad (legacy filas = activityId 'default')
ALTER TABLE "SectionQuizSubmission" ADD COLUMN IF NOT EXISTS "activityId" TEXT NOT NULL DEFAULT 'default';

-- Drop legacy unique (nombre típico Prisma)
ALTER TABLE "SectionQuizSubmission" DROP CONSTRAINT IF EXISTS "SectionQuizSubmission_enrollmentId_sectionId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "SectionQuizSubmission_enrollmentId_sectionId_activityId_key"
ON "SectionQuizSubmission"("enrollmentId", "sectionId", "activityId");
