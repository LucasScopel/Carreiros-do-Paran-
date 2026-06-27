/*
  Warnings:

  - You are about to alter the column `trailId` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `Trail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Trail` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `trailId` on the `TrailImage` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_trailId_fkey";

-- DropForeignKey
ALTER TABLE "TrailImage" DROP CONSTRAINT "TrailImage_trailId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "trailId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Trail" DROP CONSTRAINT "Trail_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "Trail_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TrailImage" ALTER COLUMN "trailId" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "TrailCollection" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "VisibilityLevel" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" BIGINT NOT NULL,

    CONSTRAINT "TrailCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrailCollectionTrail" (
    "collectionId" INTEGER NOT NULL,
    "trailId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrailCollectionTrail_pkey" PRIMARY KEY ("collectionId","trailId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrailCollection_publicId_key" ON "TrailCollection"("publicId");

-- CreateIndex
CREATE INDEX "TrailCollection_userId_idx" ON "TrailCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrailCollection_userId_name_key" ON "TrailCollection"("userId", "name");

-- CreateIndex
CREATE INDEX "TrailCollectionTrail_trailId_idx" ON "TrailCollectionTrail"("trailId");

-- AddForeignKey
ALTER TABLE "TrailImage" ADD CONSTRAINT "TrailImage_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrailCollection" ADD CONSTRAINT "TrailCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrailCollectionTrail" ADD CONSTRAINT "TrailCollectionTrail_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "TrailCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrailCollectionTrail" ADD CONSTRAINT "TrailCollectionTrail_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
