/*
  Warnings:

  - You are about to drop the `BillableAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StripePriceTag" AS ENUM ('PLAN_FEE', 'TRANSCRIPTION_MINUTE', 'CHAT_INPUT', 'CHAT_OUTPUT', 'STORAGE_PER_GB');

-- CreateEnum
CREATE TYPE "StripeInterval" AS ENUM ('month', 'year');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'mod';

-- DropForeignKey
ALTER TABLE "BillableAction" DROP CONSTRAINT "BillableAction_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "BillableAction" DROP CONSTRAINT "BillableAction_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "FeatureFlags" ADD COLUMN     "chatEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "transcriptionEnabled" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "BillableAction";

-- DropEnum
DROP TYPE "BillingActionType";

-- DropEnum
DROP TYPE "MeasuredUnits";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "features" TEXT[],
    "payAsYouGo" TEXT[],
    "sortOrder" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nickName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "unit_amount_decimal" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "tag" "StripePriceTag" NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "priceTag" "StripePriceTag" NOT NULL,
    "subscriptionId" TEXT,
    "priceId" TEXT,

    CONSTRAINT "SubscriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionCredits" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentCredits" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "preciousCredits" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "priceTag" "StripePriceTag" NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "SubscriptionCredits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCredits" ADD CONSTRAINT "SubscriptionCredits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
