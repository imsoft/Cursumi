-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
