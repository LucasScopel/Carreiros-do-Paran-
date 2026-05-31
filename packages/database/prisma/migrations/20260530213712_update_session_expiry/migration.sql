/*
  Warnings:

  - You are about to drop the column `idleExpiresAt` on the `Session` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "idleExpiresAt",
ADD COLUMN     "rememberMe" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
