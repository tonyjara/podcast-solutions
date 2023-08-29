/*
  Warnings:

  - You are about to drop the column `PlanType` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "PlanType",
ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'FREE';
