/*
  Warnings:

  - You are about to drop the `Partner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Partner";

-- CreateTable
CREATE TABLE "OtpCode" (
    "Id" SERIAL NOT NULL,
    "Purpose" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "OtpType" TEXT NOT NULL,
    "Code" TEXT,
    "IsUsed" BOOLEAN NOT NULL DEFAULT false,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "Attempts" INTEGER NOT NULL DEFAULT 0,
    "InsertDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdateDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "IPSBank" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "reconciliationAccount" TEXT NOT NULL,
    "bankLogo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IPSBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IPSBank_bankName_key" ON "IPSBank"("bankName");

-- CreateIndex
CREATE UNIQUE INDEX "IPSBank_bankCode_key" ON "IPSBank"("bankCode");
