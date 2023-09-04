-- CreateTable
CREATE TABLE "Directories" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "twitterUrl" TEXT NOT NULL,
    "facebookUrl" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "applePodcastsUrl" TEXT NOT NULL,
    "googlePodcastsUrl" TEXT NOT NULL,
    "stitcherUrl" TEXT NOT NULL,
    "tuneinUrl" TEXT NOT NULL,
    "pocketCastsUrl" TEXT NOT NULL,
    "overcastUrl" TEXT NOT NULL,
    "castroUrl" TEXT NOT NULL,
    "castboxUrl" TEXT NOT NULL,
    "podchaserUrl" TEXT NOT NULL,
    "deezerUrl" TEXT NOT NULL,
    "podfriendUrl" TEXT NOT NULL,
    "podcastAddictUrl" TEXT NOT NULL,
    "breakerUrl" TEXT NOT NULL,
    "radiopublicUrl" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,

    CONSTRAINT "Directories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Directories_podcastId_key" ON "Directories"("podcastId");

-- AddForeignKey
ALTER TABLE "Directories" ADD CONSTRAINT "Directories_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
