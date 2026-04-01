-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN "learningReflectionEmailSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LearningReflection" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningReflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningReflection_enrollmentId_key" ON "LearningReflection"("enrollmentId");

-- CreateIndex
CREATE INDEX "LearningReflection_courseId_idx" ON "LearningReflection"("courseId");

-- CreateIndex
CREATE INDEX "LearningReflection_userId_idx" ON "LearningReflection"("userId");

-- AddForeignKey
ALTER TABLE "LearningReflection" ADD CONSTRAINT "LearningReflection_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningReflection" ADD CONSTRAINT "LearningReflection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningReflection" ADD CONSTRAINT "LearningReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
