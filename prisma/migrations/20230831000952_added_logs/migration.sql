-- CreateTable
CREATE TABLE "Logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "meta" TEXT NOT NULL,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);
