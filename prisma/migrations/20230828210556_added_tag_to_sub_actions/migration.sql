/*
  Warnings:

  - You are about to drop the column `chatInputTokensAmount` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `chatOutputTokensAmount` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `currentChatInputTokens` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `currentChatOutputTokens` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `currentTranscriptionMinutes` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `prevChatInputTokens` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `prevChatOutputTokens` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `prevTranscriptionMinutes` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptionMinutesAmount` on the `SubscriptionCreditsActions` table. All the data in the column will be lost.
  - Added the required column `tag` to the `SubscriptionCreditsActions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionCreditsActions" DROP COLUMN "chatInputTokensAmount",
DROP COLUMN "chatOutputTokensAmount",
DROP COLUMN "currentChatInputTokens",
DROP COLUMN "currentChatOutputTokens",
DROP COLUMN "currentTranscriptionMinutes",
DROP COLUMN "prevChatInputTokens",
DROP COLUMN "prevChatOutputTokens",
DROP COLUMN "prevTranscriptionMinutes",
DROP COLUMN "transcriptionMinutesAmount",
ADD COLUMN     "amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
ADD COLUMN     "currentAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
ADD COLUMN     "prevAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
ADD COLUMN     "tag" "StripePriceTag" NOT NULL;
