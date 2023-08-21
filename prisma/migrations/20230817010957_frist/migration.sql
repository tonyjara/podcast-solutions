-- CreateEnum
CREATE TYPE "BillingActionType" AS ENUM ('planIncrement', 'transcription', 'chatInput', 'chatOutput');

-- CreateEnum
CREATE TYPE "MeasuredUnits" AS ENUM ('minutes', 'hours', 'seconds');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('published', 'draft', 'archived');

-- CreateEnum
CREATE TYPE "PodcastType" AS ENUM ('episodic', 'serial');

-- CreateEnum
CREATE TYPE "EpisodeType" AS ENUM ('full', 'trailer', 'bonus');

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
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "type" "PodcastType" NOT NULL DEFAULT 'episodic',

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
    "userId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "selectedAudioFileId" TEXT,

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
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "length" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'audio/mpeg',
    "podcastId" TEXT NOT NULL,

    CONSTRAINT "AudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceIds" TEXT[],
    "stripeCustomerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payedAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "invoiceId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "stripeLineItems" TEXT[],
    "stripeProductId" TEXT NOT NULL,
    "stripeCheckouCompleteEventId" TEXT,
    "validatedByStripeWebhook" BOOLEAN NOT NULL DEFAULT false,
    "validatedBySuccessPage" BOOLEAN NOT NULL DEFAULT false,
    "confirmedByWebhookAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillableAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currenInputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "previousInputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "inputTokensAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currentOutputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "previousOutputTokens" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "outputTokensAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "currentTranscriptionMinutes" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "previousTranscriptionMinutes" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "transcriptionMinutesAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "actionType" "BillingActionType" NOT NULL,
    "paymentId" TEXT,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "BillableAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PodcastToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
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
CREATE UNIQUE INDEX "AudioFile_blobName_userId_key" ON "AudioFile"("blobName", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "Payment"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "_PodcastToUser_AB_unique" ON "_PodcastToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PodcastToUser_B_index" ON "_PodcastToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRecoveryLinks" ADD CONSTRAINT "PasswordRecoveryLinks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeChat" ADD CONSTRAINT "EpisodeChat_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillableAction" ADD CONSTRAINT "BillableAction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillableAction" ADD CONSTRAINT "BillableAction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastToUser" ADD CONSTRAINT "_PodcastToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PodcastToUser" ADD CONSTRAINT "_PodcastToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
