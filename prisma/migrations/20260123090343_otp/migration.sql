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
