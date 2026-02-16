/*
  Warnings:

  - You are about to drop the column `device` on the `SystemActivityLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SystemActivityLog" DROP COLUMN "device";

-- CreateTable
CREATE TABLE "SecurityPolicy" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mfaRequired" BOOLEAN NOT NULL DEFAULT true,
    "allowedMfaMethods" TEXT[] DEFAULT ARRAY['email']::TEXT[],
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "concurrentSessions" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SecurityPolicy_pkey" PRIMARY KEY ("id")
);
