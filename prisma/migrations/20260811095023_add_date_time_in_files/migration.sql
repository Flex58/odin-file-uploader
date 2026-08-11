/*
  Warnings:

  - Added the required column `uploadTime` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "uploadTime" TIMESTAMP(3) NOT NULL;
