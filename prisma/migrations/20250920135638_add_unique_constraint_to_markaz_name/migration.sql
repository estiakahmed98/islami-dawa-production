/*
  Warnings:

  - You are about to drop the column `markaz` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "markaz",
ADD COLUMN     "markazId" TEXT;

-- CreateTable
CREATE TABLE "Markaz" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "union" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Markaz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Markaz_name_key" ON "Markaz"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_markazId_fkey" FOREIGN KEY ("markazId") REFERENCES "Markaz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
