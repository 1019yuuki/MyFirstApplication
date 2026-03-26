-- CreateEnum
CREATE TYPE "StoneType" AS ENUM ('BLACK', 'WHITE', 'NONE');

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "board" "StoneType"[] DEFAULT ARRAY[]::"StoneType"[],
    "next_stone" "StoneType" NOT NULL DEFAULT 'BLACK',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
