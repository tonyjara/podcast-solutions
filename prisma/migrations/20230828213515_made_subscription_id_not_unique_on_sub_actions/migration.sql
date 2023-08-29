-- DropForeignKey
ALTER TABLE "SubscriptionCreditsActions" DROP CONSTRAINT "SubscriptionCreditsActions_subscriptionId_fkey";

-- DropIndex
DROP INDEX "SubscriptionCreditsActions_subscriptionId_key";

-- AlterTable
ALTER TABLE "SubscriptionCreditsActions" ALTER COLUMN "subscriptionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SubscriptionCreditsActions" ADD CONSTRAINT "SubscriptionCreditsActions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
