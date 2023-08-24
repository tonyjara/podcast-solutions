/*
  Warnings:

  - You are about to drop the column `category` on the `Podcast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[];
