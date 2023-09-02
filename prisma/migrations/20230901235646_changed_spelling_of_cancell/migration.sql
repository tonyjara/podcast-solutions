/*
  Warnings:

  - You are about to drop the column `cancelAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `canceledAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `eventCancelationId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "cancelAt",
DROP COLUMN "canceledAt",
DROP COLUMN "eventCancelationId",
ADD COLUMN     "cancellAt" TIMESTAMP(3),
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "eventCancellationId" TEXT;
