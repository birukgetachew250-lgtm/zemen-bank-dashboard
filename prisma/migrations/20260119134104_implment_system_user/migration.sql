/*
  Warnings:

  - You are about to drop the column `aiResult` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `IPSBank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MiniApp` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "SecurityPolicy" ALTER COLUMN "allowedMfaMethods" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "aiResult";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAttempt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';

-- DropTable
DROP TABLE "IPSBank";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "MiniApp";
