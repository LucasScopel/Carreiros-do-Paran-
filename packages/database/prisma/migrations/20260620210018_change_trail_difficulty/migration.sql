/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Trail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trail" DROP COLUMN "difficulty",
ADD COLUMN     "difficultySum" INTEGER NOT NULL DEFAULT 0;
