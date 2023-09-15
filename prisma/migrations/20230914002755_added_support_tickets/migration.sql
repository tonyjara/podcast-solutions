-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'closed', 'inProgress');

-- CreateEnum
CREATE TYPE "SupportTicketType" AS ENUM ('question', 'bug', 'featureRequest');

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL,
    "priority" "SupportTicketPriority" NOT NULL,
    "type" "SupportTicketType" NOT NULL,
    "imageUrl" TEXT,
    "imageName" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
