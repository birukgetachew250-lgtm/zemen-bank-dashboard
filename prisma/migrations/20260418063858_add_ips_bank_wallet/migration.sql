-- CreateTable
CREATE TABLE "IPSBank" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "reconciliationAccount" TEXT NOT NULL,
    "bankLogo" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "status" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "branchCode" TEXT NOT NULL,

    CONSTRAINT "IPSBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IPSWallet" (
    "id" TEXT NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletCode" TEXT NOT NULL,
    "reconciliationAccount" TEXT NOT NULL,
    "walletLogo" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "status" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "branchCode" TEXT NOT NULL,

    CONSTRAINT "IPSWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IPSBank_bankCode_key" ON "IPSBank"("bankCode");

-- CreateIndex
CREATE INDEX "IPSBank_status_idx" ON "IPSBank"("status");

-- CreateIndex
CREATE INDEX "IPSBank_rank_idx" ON "IPSBank"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "IPSWallet_walletCode_key" ON "IPSWallet"("walletCode");

-- CreateIndex
CREATE INDEX "IPSWallet_status_idx" ON "IPSWallet"("status");

-- CreateIndex
CREATE INDEX "IPSWallet_rank_idx" ON "IPSWallet"("rank");
