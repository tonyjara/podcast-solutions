-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'HOBBY', 'BASIC', 'PRO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "PlanType" "PlanType" NOT NULL DEFAULT 'FREE';
