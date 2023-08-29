/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `SubscriptionCreditsActions` will be added. If there are existing duplicate values, this will fail.
  - Made the column `subscriptionId` on table `SubscriptionCreditsActions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionCreditsActions" DROP CONSTRAINT "SubscriptionCreditsActions_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "SubscriptionCreditsActions" ALTER COLUMN "subscriptionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionCreditsActions_subscriptionId_key" ON "SubscriptionCreditsActions"("subscriptionId");

-- AddForeignKey
ALTER TABLE "SubscriptionCreditsActions" ADD CONSTRAINT "SubscriptionCreditsActions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
