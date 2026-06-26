/*
  Warnings:

  - Added the required column `visitDate` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "visitDate" TIMESTAMP(3) NOT NULL;
