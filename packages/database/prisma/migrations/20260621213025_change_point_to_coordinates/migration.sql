/*
  Warnings:

  - You are about to drop the column `point` on the `Trail` table. All the data in the column will be lost.
  - Added the required column `coordinates` to the `Trail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trail" DROP COLUMN "point",
ADD COLUMN     "coordinates" geometry(Point,4326) NOT NULL;
