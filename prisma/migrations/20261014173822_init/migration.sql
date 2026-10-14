-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('ROOM', 'EQUIPMENT', 'VEHICLE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");

-- CreateIndex
CREATE INDEX "Resource_category_isActive_idx" ON "Resource"("category", "isActive");

-- CreateIndex
CREATE INDEX "Reservation_resourceId_startAt_idx" ON "Reservation"("resourceId", "startAt");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_status_startAt_idx" ON "Reservation"("status", "startAt");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_valid_range" CHECK ("endAt" > "startAt");

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_no_overlap"
  EXCLUDE USING gist (
    "resourceId" WITH =,
    tstzrange("startAt", "endAt", '[)') WITH &&
  ) WHERE ("status" <> 'CANCELLED');