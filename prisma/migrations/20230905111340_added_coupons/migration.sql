-- AlterTable
ALTER TABLE "AccountVerificationLinks" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "couponCode" TEXT NOT NULL,
    "hasBeenClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "chatInputCredits" INTEGER NOT NULL DEFAULT 0,
    "chatOutputCredits" INTEGER NOT NULL DEFAULT 0,
    "transcriptionMinutes" INTEGER NOT NULL DEFAULT 0,
    "subscriptionId" TEXT,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_couponCode_key" ON "Coupons"("couponCode");

-- AddForeignKey
ALTER TABLE "Coupons" ADD CONSTRAINT "Coupons_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
