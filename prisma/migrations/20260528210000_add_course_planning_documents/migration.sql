-- ─── CoursePlanningDocument ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "CoursePlanningDocument" (
  "id"        TEXT         NOT NULL,
  "courseId"  TEXT         NOT NULL,
  "type"      TEXT         NOT NULL,
  "data"      JSONB        NOT NULL,
  "status"    TEXT         NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CoursePlanningDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CoursePlanningDocument_courseId_type_key" UNIQUE ("courseId", "type"),
  CONSTRAINT "CoursePlanningDocument_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CoursePlanningDocument_courseId_idx" ON "CoursePlanningDocument"("courseId");
