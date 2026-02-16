-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_branchId_fkey";

-- DropForeignKey
ALTER TABLE "PendingApproval" DROP CONSTRAINT "PendingApproval_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_customerId_fkey";

-- AlterTable
ALTER TABLE "SecurityPolicy" ALTER COLUMN "allowedMfaMethods" DROP DEFAULT;
