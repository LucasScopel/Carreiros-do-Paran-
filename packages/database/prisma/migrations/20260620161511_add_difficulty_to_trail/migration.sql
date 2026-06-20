/*
  Warnings:

  - Added the required column `difficulty` to the `Trail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trail" ADD COLUMN     "difficulty" TEXT NOT NULL;
