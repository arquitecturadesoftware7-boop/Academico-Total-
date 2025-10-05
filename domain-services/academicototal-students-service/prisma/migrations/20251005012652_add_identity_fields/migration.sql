/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `student_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `student_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STUDENT';

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_email_key" ON "student_profiles"("email");
