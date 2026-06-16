/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatarVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hasAvatar" BOOLEAN NOT NULL DEFAULT false;
