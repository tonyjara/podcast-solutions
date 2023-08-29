/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceIds` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "subscriptionId";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripePriceIds",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "productId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_productId_key" ON "Subscription"("productId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
