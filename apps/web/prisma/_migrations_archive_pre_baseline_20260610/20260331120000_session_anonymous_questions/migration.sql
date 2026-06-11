-- CreateEnum
CREATE TYPE "SessionAnonymousQuestionStatus" AS ENUM ('open', 'answered', 'dismissed');

-- CreateTable
CREATE TABLE "SessionAnonymousQuestion" (
    "id" TEXT NOT NULL,
    "courseSessionId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SessionAnonymousQuestionStatus" NOT NULL DEFAULT 'open',
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAnonymousQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionAnonymousQuestion_courseSessionId_createdAt_idx" ON "SessionAnonymousQuestion"("courseSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionAnonymousQuestion_courseId_idx" ON "SessionAnonymousQuestion"("courseId");

-- CreateIndex
CREATE INDEX "SessionAnonymousQuestion_authorId_idx" ON "SessionAnonymousQuestion"("authorId");

-- AddForeignKey
ALTER TABLE "SessionAnonymousQuestion" ADD CONSTRAINT "SessionAnonymousQuestion_courseSessionId_fkey" FOREIGN KEY ("courseSessionId") REFERENCES "CourseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAnonymousQuestion" ADD CONSTRAINT "SessionAnonymousQuestion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAnonymousQuestion" ADD CONSTRAINT "SessionAnonymousQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
