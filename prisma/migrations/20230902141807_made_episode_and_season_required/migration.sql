/*
  Warnings:

  - Made the column `seasonNumber` on table `Episode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `episodeNumber` on table `Episode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Episode" ALTER COLUMN "seasonNumber" SET NOT NULL,
ALTER COLUMN "episodeNumber" SET NOT NULL;
