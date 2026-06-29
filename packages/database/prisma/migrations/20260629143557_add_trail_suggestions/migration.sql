-- CreateEnum
CREATE TYPE "TrailSuggestionStatus" AS ENUM ('PENDING', 'TODO', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "TrailSuggestion" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "details" TEXT NOT NULL,
    "status" "TrailSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrailSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrailSuggestion_publicId_key" ON "TrailSuggestion"("publicId");

-- CreateIndex
CREATE INDEX "TrailSuggestion_userId_idx" ON "TrailSuggestion"("userId");

-- CreateIndex
CREATE INDEX "TrailSuggestion_status_id_idx" ON "TrailSuggestion"("status", "id");

-- AddForeignKey
ALTER TABLE "TrailSuggestion" ADD CONSTRAINT "TrailSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
