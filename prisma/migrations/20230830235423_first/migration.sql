-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user', 'mod');

-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('published', 'draft', 'archived');

-- CreateEnum
CREATE TYPE "PodcastStatus" AS ENUM ('published', 'unpublished', 'archived', 'private', 'unlisted');

-- CreateEnum
CREATE TYPE "PodcastType" AS ENUM ('episodic', 'serial');

-- CreateEnum
CREATE TYPE "EpisodeType" AS ENUM ('full', 'trailer', 'bonus');

-- CreateEnum
CREATE TYPE "StripePriceTag" AS ENUM ('PLAN_FEE', 'TRANSCRIPTION_MINUTE', 'CHAT_INPUT', 'CHAT_OUTPUT', 'STORAGE_PER_GB');

-- CreateEnum
CREATE TYPE "StripeInterval" AS ENUM ('month', 'year');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'HOBBY', 'BASIC', 'PRO');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountVerificationLinks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationLink" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hasBeenUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AccountVerificationLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordRecoveryLinks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recoveryLink" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hasBeenUsed" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT,

    CONSTRAINT "PasswordRecoveryLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasSeenOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "selectedPodcastId" TEXT NOT NULL,
    "showTranscriptionWarning" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "podcastStatus" "PodcastStatus" NOT NULL DEFAULT 'unpublished',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categories" TEXT[],
    "language" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "type" "PodcastType" NOT NULL DEFAULT 'episodic',
    "subscriptionId" TEXT,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "showNotes" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "status" "EpisodeStatus" NOT NULL DEFAULT 'draft',
    "seasonNumber" INTEGER,
    "episodeNumber" INTEGER,
    "episodeType" "EpisodeType" NOT NULL DEFAULT 'full',
    "selectedAudioFileId" TEXT,
    "subscriptionId" TEXT,
    "podcastId" TEXT NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodeChat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "episodeId" TEXT,

    CONSTRAINT "EpisodeChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "blobName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isHostedByPS" BOOLEAN NOT NULL DEFAULT true,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "length" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'audio/mpeg',
    "episodeId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "AudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "eventCancelationId" TEXT,
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "features" TEXT NOT NULL,
    "payAsYouGo" TEXT NOT NULL,
    "sortOrder" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nickName" TEXT NOT NULL,
    "sortOrder" TEXT NOT NULL,
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
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "unit_amount_decimal" TEXT NOT NULL,
    "validatedByWebhook" BOOLEAN NOT NULL DEFAULT false,
    "validatedBySuccessPage" BOOLEAN NOT NULL DEFAULT false,
    "confirmedByWebhookAt" TIMESTAMP(3),
    "confirmationEventId" TEXT,
    "userId" TEXT,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionCreditsActions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "prevAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "tag" "StripePriceTag" NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "SubscriptionCreditsActions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlags" (
    "id" TEXT NOT NULL,
    "signupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rssEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transcriptionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "chatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FeatureFlags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_userId_key" ON "Preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_slug_key" ON "Podcast"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AudioFile_blobName_subscriptionId_key" ON "AudioFile"("blobName", "subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRecoveryLinks" ADD CONSTRAINT "PasswordRecoveryLinks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeChat" ADD CONSTRAINT "EpisodeChat_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCreditsActions" ADD CONSTRAINT "SubscriptionCreditsActions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
