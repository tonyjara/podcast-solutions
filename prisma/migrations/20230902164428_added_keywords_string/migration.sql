/*
  Warnings:

  - You are about to drop the column `keyWords` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "keyWords",
ADD COLUMN     "keywords" TEXT NOT NULL DEFAULT '';
