/*
  Warnings:

  - You are about to drop the column `peakData` on the `AudioFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AudioFile" DROP COLUMN "peakData",
ADD COLUMN     "peaks" INTEGER[];
