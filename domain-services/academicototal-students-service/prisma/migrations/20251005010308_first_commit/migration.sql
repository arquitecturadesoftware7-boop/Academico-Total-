-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'LEAVE');

-- CreateTable
CREATE TABLE "student_profiles" (
    "student_id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "entryYear" INTEGER NOT NULL,
    "major" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("student_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_enrollmentId_key" ON "student_profiles"("enrollmentId");
