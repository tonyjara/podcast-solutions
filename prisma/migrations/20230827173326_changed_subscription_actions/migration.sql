/*
  Warnings:

  - You are about to drop the `SubscriptionCredits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionCredits" DROP CONSTRAINT "SubscriptionCredits_subscriptionId_fkey";

-- DropTable
DROP TABLE "SubscriptionCredits";

-- CreateTable
CREATE TABLE "SubscriptionCreditsActions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentTranscriptionMinutes" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "prevTranscriptionMinutes" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "transcriptionMinutesAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currentChatInputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "prevChatInputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "chatInputTokensAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currentChatOutputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "prevChatOutputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "chatOutputTokensAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "subscriptionId" TEXT,

    CONSTRAINT "SubscriptionCreditsActions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubscriptionCreditsActions" ADD CONSTRAINT "SubscriptionCreditsActions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
