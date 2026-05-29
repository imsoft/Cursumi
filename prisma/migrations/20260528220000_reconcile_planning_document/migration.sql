-- Reconcilia CoursePlanningDocument con el datamodel de Prisma
-- (updatedAt sin DEFAULT — lo gestiona @updatedAt — y FK con ON UPDATE CASCADE).

-- DropForeignKey
ALTER TABLE "CoursePlanningDocument" DROP CONSTRAINT "CoursePlanningDocument_courseId_fkey";

-- AlterTable
ALTER TABLE "CoursePlanningDocument" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "CoursePlanningDocument" ADD CONSTRAINT "CoursePlanningDocument_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
