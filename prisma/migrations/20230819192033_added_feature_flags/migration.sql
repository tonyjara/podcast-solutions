-- CreateTable
CREATE TABLE "FeatureFlags" (
    "id" TEXT NOT NULL,
    "signupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rssEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FeatureFlags_pkey" PRIMARY KEY ("id")
);
