/*
  Warnings:

  - You are about to drop the column `baseUrl` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Integration` table. All the data in the column will be lost.
  - Added the required column `endpointUrl` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Integration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "baseUrl",
DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endpointUrl" TEXT NOT NULL,
ADD COLUMN     "service" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
