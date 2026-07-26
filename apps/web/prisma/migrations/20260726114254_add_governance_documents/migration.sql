-- CreateEnum
CREATE TYPE "GovernanceRole" AS ENUM ('owner', 'ceo', 'cfo');
-- CreateTable
CREATE TABLE "GovernanceDocument" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GovernanceDocument_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "GovernanceVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedBy" TEXT NOT NULL,
    "changeNote" TEXT,
    CONSTRAINT "GovernanceVersion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "GovernanceAcceptance" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "GovernanceRole" NOT NULL,
    "fullName" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GovernanceAcceptance_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "GovernanceDocument_slug_key" ON "GovernanceDocument"("slug");
-- CreateIndex
CREATE INDEX "GovernanceVersion_documentId_idx" ON "GovernanceVersion"("documentId");
-- CreateIndex
CREATE UNIQUE INDEX "GovernanceVersion_documentId_version_key" ON "GovernanceVersion"("documentId", "version");
-- CreateIndex
CREATE INDEX "GovernanceAcceptance_versionId_idx" ON "GovernanceAcceptance"("versionId");
-- CreateIndex
CREATE INDEX "GovernanceAcceptance_userId_idx" ON "GovernanceAcceptance"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "GovernanceAcceptance_versionId_userId_key" ON "GovernanceAcceptance"("versionId", "userId");
-- AddForeignKey
ALTER TABLE "GovernanceVersion" ADD CONSTRAINT "GovernanceVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GovernanceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "GovernanceAcceptance" ADD CONSTRAINT "GovernanceAcceptance_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "GovernanceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
