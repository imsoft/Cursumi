-- ─── WishlistItem ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WishlistItem" (
  "id"        TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "courseId"  TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WishlistItem_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "WishlistItem_userId_courseId_key" UNIQUE ("userId", "courseId"),
  CONSTRAINT "WishlistItem_userId_fkey"
    FOREIGN KEY ("userId")   REFERENCES "User"("id")   ON DELETE CASCADE,
  CONSTRAINT "WishlistItem_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "WishlistItem_userId_idx" ON "WishlistItem"("userId");

-- ─── CourseNote ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "CourseNote" (
  "id"        TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "courseId"  TEXT         NOT NULL,
  "lessonId"  TEXT,
  "content"   TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CourseNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CourseNote_userId_fkey"
    FOREIGN KEY ("userId")   REFERENCES "User"("id")    ON DELETE CASCADE,
  CONSTRAINT "CourseNote_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id")  ON DELETE CASCADE,
  CONSTRAINT "CourseNote_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")  ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "CourseNote_userId_idx"   ON "CourseNote"("userId");
CREATE INDEX IF NOT EXISTS "CourseNote_courseId_idx" ON "CourseNote"("courseId");
CREATE INDEX IF NOT EXISTS "CourseNote_lessonId_idx" ON "CourseNote"("lessonId");

-- ─── BlogPost ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id"            TEXT         NOT NULL,
  "title"         TEXT         NOT NULL,
  "slug"          TEXT         NOT NULL,
  "excerpt"       TEXT,
  "content"       TEXT         NOT NULL,
  "coverImageUrl" TEXT,
  "published"     BOOLEAN      NOT NULL DEFAULT false,
  "publishedAt"   TIMESTAMP(3),
  "tags"          TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "authorId"      TEXT         NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlogPost_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "BlogPost_slug_key" UNIQUE ("slug"),
  CONSTRAINT "BlogPost_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
);

CREATE INDEX IF NOT EXISTS "BlogPost_published_idx" ON "BlogPost"("published");
CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx"      ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_authorId_idx"  ON "BlogPost"("authorId");
