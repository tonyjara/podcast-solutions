-- AlterTable
ALTER TABLE "Directories" ADD COLUMN     "amazonMusicUrl" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "spotifyUrl" SET DEFAULT '',
ALTER COLUMN "applePodcastsUrl" SET DEFAULT '',
ALTER COLUMN "googlePodcastsUrl" SET DEFAULT '',
ALTER COLUMN "stitcherUrl" SET DEFAULT '',
ALTER COLUMN "tuneinUrl" SET DEFAULT '',
ALTER COLUMN "pocketCastsUrl" SET DEFAULT '',
ALTER COLUMN "overcastUrl" SET DEFAULT '',
ALTER COLUMN "castroUrl" SET DEFAULT '',
ALTER COLUMN "castboxUrl" SET DEFAULT '',
ALTER COLUMN "podchaserUrl" SET DEFAULT '',
ALTER COLUMN "deezerUrl" SET DEFAULT '',
ALTER COLUMN "podfriendUrl" SET DEFAULT '',
ALTER COLUMN "podcastAddictUrl" SET DEFAULT '',
ALTER COLUMN "breakerUrl" SET DEFAULT '',
ALTER COLUMN "radiopublicUrl" SET DEFAULT '';
