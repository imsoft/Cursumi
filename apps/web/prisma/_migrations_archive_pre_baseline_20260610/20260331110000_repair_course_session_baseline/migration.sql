-- Reparación de historial: CourseSession se creó originalmente con `db push` y
-- ninguna migración la registró, lo que rompe la shadow DB de `migrate dev`.
-- Refleja el estado ORIGINAL de la tabla: SIN "state" ni "meetingUrl" (esas columnas
-- las añaden migraciones posteriores). IF NOT EXISTS la hace no-op donde ya exista (prod).
CREATE TABLE IF NOT EXISTS "CourseSession" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "joinCodeHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CourseSession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CourseSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CourseSession_courseId_idx" ON "CourseSession"("courseId");
CREATE INDEX IF NOT EXISTS "CourseSession_courseId_date_idx" ON "CourseSession"("courseId", "date");
